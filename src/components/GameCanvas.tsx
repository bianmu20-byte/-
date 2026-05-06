import React, { useEffect, useRef, useState } from 'react';
import { GameNote } from '../lib/audioAnalysis';
import { Pause, Play, Square } from 'lucide-react';

interface GameCanvasProps {
  audioBuffer: AudioBuffer;
  audioCtx: AudioContext;
  notes: GameNote[];
  trackName?: string;
  onGameOver: (score: number, maxCombo: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Message {
  text: string;
  timer: number;
  x: number;
  y: number;
  color: string;
}

export default function GameCanvas({ audioBuffer, audioCtx, notes, trackName = 'Custom Track', onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Use a ref for all fast-changing game state to avoid React re-renders in the loop
  const gs = useRef({
    score: 0,
    combo: 0,
    maxCombo: 0,
    playerAction: '' as string,
    actionTimer: 0,
    particles: [] as Particle[],
    messages: [] as Message[],
  });

  // Deep copy notes so we don't mutate the original array if we play again
  const notesRef = useRef<GameNote[]>(JSON.parse(JSON.stringify(notes)));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Start Audio
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
    const startTime = audioCtx.currentTime;

    // Key Handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore hold
      
      let keyType: GameNote['type'] | null = null;
      if (e.code === 'ArrowUp') keyType = 'up';
      if (e.code === 'ArrowDown') keyType = 'down';
      if (e.code === 'Space') keyType = 'space';

      if (!keyType) return;
      if (e.code === 'Space' || e.code.startsWith('Arrow')) {
        e.preventDefault(); // Stop page scroll
      }

      gs.current.playerAction = keyType;
      gs.current.actionTimer = 0.25; // 250ms animation

      const currentTime = audioCtx.currentTime - startTime;
      let hitNote: GameNote | null = null;
      let minDiff = Infinity;

      // Find closest unhit note of this type within hit window (0.25s radius)
      for (const note of notesRef.current) {
        if (!note.hit && !note.missed && note.type === keyType) {
          const diff = Math.abs(note.time - currentTime);
          if (diff < 0.25 && diff < minDiff) {
            minDiff = diff;
            hitNote = note;
          }
        }
      }

      if (hitNote) {
        hitNote.hit = true;
        gs.current.combo++;
        if (gs.current.combo > gs.current.maxCombo) {
          gs.current.maxCombo = gs.current.combo;
        }

        let points = 100;
        let text = 'GREAT';
        let color = '#00FF00';

        // Perfect Hit
        if (minDiff < 0.08) {
          points = 300;
          text = 'PERFECT';
          color = '#D4AF37'; // Gold
        }

        gs.current.score += points * (1 + Math.floor(gs.current.combo / 10));

        gs.current.messages.push({
          text,
          timer: 0.6,
          x: 200,
          y: hitNote.type === 'down' ? 250 : 320,
          color,
        });

        // Spawn hit particles
        for (let i = 0; i < 15; i++) {
          gs.current.particles.push({
            x: 200,
            y: hitNote.type === 'down' ? 280 : 360,
            vx: (Math.random() - 0.5) * 500,
            vy: (Math.random() - 0.5) * 500,
            life: 0.6,
            color,
          });
        }
      } else {
        // Punish random button mashing by resetting combo
        // only if they mashed during an empty window? Let's just always break it on a wrong press to be strictly rhythmic.
        if (gs.current.combo > 0) {
            gs.current.combo = 0;
            gs.current.messages.push({ text: 'MISS', timer: 0.5, x: 200, y: 320, color: '#B71C1C' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    let animationFrameId: number;
    let lastFrameTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastFrameTime) / 1000;
      lastFrameTime = time;

      if (audioCtx.state === 'suspended') {
        const currentTime = audioCtx.currentTime - startTime;
        draw(ctx, currentTime, 0); // dt=0
      } else {
        const currentTime = audioCtx.currentTime - startTime;

        // Ensure Audio finishes
        if (currentTime > audioBuffer.duration + 2) {
          onGameOver(gs.current.score, gs.current.maxCombo);
          return;
        }

        update(dt, currentTime);
        draw(ctx, currentTime, dt);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
      try { source.stop(); } catch(e) {}
    };
  }, [audioBuffer, audioCtx, onGameOver]);

  const togglePause = () => {
    if (audioCtx.state === 'running') {
      audioCtx.suspend().then(() => setIsPaused(true));
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => setIsPaused(false));
    }
  };

  const handleEndGame = () => {
    onGameOver(gs.current.score, gs.current.maxCombo);
  };

  const update = (dt: number, currentTime: number) => {
    // Note misses
    for (const note of notesRef.current) {
      if (!note.hit && !note.missed && note.time - currentTime < -0.15) {
        note.missed = true;
        gs.current.combo = 0;
        gs.current.messages.push({
          text: 'MISS',
          timer: 0.5,
          x: 100,
          y: 350,
          color: '#B71C1C',
        });
      }
    }

    // Timers
    if (gs.current.actionTimer > 0) {
      gs.current.actionTimer -= dt;
      if (gs.current.actionTimer <= 0) {
        gs.current.playerAction = '';
      }
    }

    // Particles Update
    for (let i = gs.current.particles.length - 1; i >= 0; i--) {
      const p = gs.current.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) gs.current.particles.splice(i, 1);
    }

    // Messages Update
    for (let i = gs.current.messages.length - 1; i >= 0; i--) {
      const m = gs.current.messages[i];
      m.timer -= dt;
      m.y -= 50 * dt; // float up
      if (m.timer <= 0) gs.current.messages.splice(i, 1);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, currentTime: number, dt: number) => {
    const s = gs.current;

    // Background Gradient
    ctx.clearRect(0, 0, 1000, 500);
    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, 'rgba(42, 10, 10, 0)'); // transparent top
    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1000, 500);

    // Stage Floor
    ctx.fillStyle = 'rgba(26, 26, 26, 0.5)';
    ctx.fillRect(0, 400, 1000, 100);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'; // Gold Trim
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(1000, 400);
    ctx.stroke();

    // Moving Floor Lines for Speed Illusion
    const NOTE_SPEED = 600;
    const offset = (currentTime * NOTE_SPEED) % 150;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let i = -1; i < 10; i++) {
        const x = i * 150 - offset + 150;
        ctx.moveTo(x, 400);
        ctx.lineTo(x - 60, 500);
    }
    ctx.stroke();

    // Hit Zone Marker
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)'; // Faint gold radius
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(200, 360, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    // Notes
    for (const note of notesRef.current) {
        if (note.hit) continue;
        const noteX = 200 + (note.time - currentTime) * NOTE_SPEED;

        if (noteX > -50 && noteX < 1050) {
            ctx.save();
            ctx.translate(noteX, 0);

            if (note.type === 'up') {
                // Ground Spike
                ctx.fillStyle = '#B71C1C';
                ctx.beginPath();
                ctx.moveTo(0, 340);
                ctx.lineTo(15, 400);
                ctx.lineTo(-15, 400);
                ctx.fill();
                ctx.strokeStyle = '#D4AF37';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (note.type === 'down') {
                // Guillotine Blade
                ctx.fillStyle = '#222';
                ctx.fillRect(-5, 150, 10, 130);
                ctx.fillStyle = '#B71C1C';
                ctx.beginPath();
                ctx.moveTo(-15, 280);
                ctx.lineTo(15, 280);
                ctx.lineTo(0, 320);
                ctx.fill();
            } else if (note.type === 'space') {
                if (note.variant === 0) {
                    // Running Minion
                    ctx.fillStyle = '#1a1a1a'; 
                    ctx.beginPath();
                    ctx.arc(0, 360, 20, 0, Math.PI * 2); // Body
                    ctx.fill();
                    ctx.strokeStyle = '#B71C1C';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Mask
                    ctx.fillStyle = '#D4AF37';
                    ctx.fillRect(-12, 350, 24, 15);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(-6, 355, 4, 4);
                    ctx.fillRect(2, 355, 4, 4);
                } else {
                    // Wall Object
                    ctx.fillStyle = 'rgba(42, 10, 10, 0.8)';
                    ctx.fillRect(-15, 250, 30, 150);
                    ctx.strokeStyle = '#B71C1C';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(-15, 250, 30, 150);
                    // Cracks
                    ctx.beginPath();
                    ctx.moveTo(-15, 300);
                    ctx.lineTo(-5, 310);
                    ctx.lineTo(15, 290);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }
    }

    // Player (Small Figure)
    ctx.save();
    ctx.translate(200, 0);

    const isRunning = s.playerAction === '';
    const bounce = isRunning ? Math.abs(Math.sin(currentTime * 15)) * 5 : 0;

    let yOff = 400 - bounce;
    let h = 40; // Smaller body height
    const w = 24; // Body width

    if (s.playerAction === 'up') {
        yOff = 280; // Jump height
    } else if (s.playerAction === 'down') {
        yOff = 400; 
        h = 20; // Duck height
    }

    // Body
    ctx.fillStyle = '#B71C1C';
    ctx.fillRect(-w/2, yOff - h, w, h);

    // Head
    ctx.fillStyle = '#f5f2ed';
    ctx.beginPath();
    ctx.arc(0, yOff - h - 14, 14, 0, Math.PI * 2);
    ctx.fill();

    // Small Wig
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-10, yOff - h - 14, 8, 0, Math.PI * 2);
    ctx.arc(10, yOff - h - 14, 8, 0, Math.PI * 2);
    ctx.arc(0, yOff - h - 22, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Legs
    ctx.strokeStyle = '#f5f2ed';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    if (s.playerAction === 'up') {
        ctx.beginPath();
        ctx.moveTo(-6, yOff);
        ctx.lineTo(-12, yOff + 10);
        ctx.moveTo(6, yOff);
        ctx.lineTo(8, yOff + 15);
        ctx.stroke();
    } else if (s.playerAction === 'down') {
        ctx.beginPath();
        ctx.moveTo(-w/2 + 4, yOff);
        ctx.lineTo(-w/2 - 10, yOff);
        ctx.moveTo(w/2 - 4, yOff);
        ctx.lineTo(w/2 + 15, yOff);
        ctx.stroke();
    } else {
        const legSwing = Math.sin(currentTime * 20) * 12;
        ctx.beginPath();
        ctx.moveTo(-6, yOff);
        ctx.lineTo(-6 + legSwing, yOff + 12);
        ctx.moveTo(6, yOff);
        ctx.lineTo(6 - legSwing, yOff + 12);
        ctx.stroke();
    }

    // Action Overlays
    if (s.playerAction === 'space') {
        // Strike
        ctx.strokeStyle = '#f5f2ed';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#B71C1C';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, yOff - h + 10);
        ctx.lineTo(50, yOff - h + 20);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Strike FX
        ctx.fillStyle = '#B71C1C';
        ctx.beginPath();
        ctx.arc(50, yOff - h + 20, 12, 0, Math.PI*2);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#D4AF37';
        ctx.stroke();
    } else {
        // Arm Run Swing
        const armSwing = Math.sin(currentTime * 20) * 10;
        ctx.strokeStyle = '#f5f2ed';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, yOff - h + 15);
        ctx.lineTo(-armSwing, yOff - h + 25);
        ctx.stroke();
    }

    ctx.restore();

    // Particles
    for (const p of s.particles) {
        ctx.globalAlpha = p.life * 1.5;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Messages
    for (const m of s.messages) {
        ctx.globalAlpha = m.timer * 2;
        ctx.fillStyle = m.color;
        ctx.font = 'italic 700 36px serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 15;
        ctx.fillText(m.text, m.x, m.y);
        ctx.shadowBlur = 0; // reset
    }
    ctx.globalAlpha = 1;

    // UI HUD
    ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.font = 'bold 12px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.textAlign = 'left';
    ctx.fillText(`TOTAL SCORE`, 20, 30);
    ctx.fillStyle = '#f5f2ed';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`${s.score.toString().padStart(7, '0')}`, 20, 65);

    if (s.combo > 4) {
        ctx.fillStyle = '#B71C1C'; 
        ctx.font = 'italic 900 64px serif';
        ctx.textAlign = 'right';
        ctx.shadowColor = 'rgba(183,28,28,0.4)';
        ctx.shadowBlur = 10;
        ctx.fillText(`${s.combo}`, 980, 60);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#D4AF37';
        ctx.font = 'bold 12px sans-serif';
        ctx.letterSpacing = '5px';
        ctx.fillText(`COMBO`, 980, 85);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center">
      <div className="w-full max-w-5xl px-8 flex justify-between items-end mb-4 border-b border-gold-500/20 pb-4 flex-wrap gap-4">
        <div>
          <span className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-1 font-sans font-bold block">Now Performing</span>
          <h1 className="text-3xl italic">{trackName} <span className="text-crimson-500 not-italic font-sans font-black tracking-tighter">ROCK REMIX</span></h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={togglePause}
            className="flex items-center gap-2 px-4 py-2 border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-onyx transition-colors font-sans text-xs font-bold uppercase tracking-widest skew-x-[-12deg]"
          >
            <span className="skew-x-[12deg] flex items-center gap-2">
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              {isPaused ? '继续' : '暂停'}
            </span>
          </button>
          <button 
            onClick={handleEndGame}
            className="flex items-center gap-2 px-4 py-2 border border-crimson-500 text-crimson-500 hover:bg-crimson-500 hover:text-white transition-colors font-sans text-xs font-bold uppercase tracking-widest skew-x-[-12deg]"
          >
            <span className="skew-x-[12deg] flex items-center gap-2">
              <Square className="w-4 h-4 fill-current" />
              结束
            </span>
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={1000}
        height={500}
        className="w-full max-w-5xl aspect-[2/1] bg-onyx border-y border-gold-500/10 shadow-[0_0_30px_rgba(212,175,55,0.05)] backdrop-blur-sm"
      />
      
      <footer className="w-full max-w-5xl p-6 px-10 bg-velvet border-t border-gold-500/10 flex flex-col sm:flex-row justify-between items-center mt-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border border-gold-500/40 rounded flex items-center justify-center font-sans font-bold text-gold-500">↑</div>
            <span className="text-[10px] mt-2 text-gold-500/60 tracking-widest uppercase">跳跃避开地刺</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border border-gold-500/40 rounded flex items-center justify-center font-sans font-bold text-gold-500">↓</div>
            <span className="text-[10px] mt-2 text-gold-500/60 tracking-widest uppercase">下蹲避开铡刀</span>
          </div>
          <div className="w-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-32 h-10 border border-crimson-500 rounded flex items-center justify-center font-sans font-bold text-crimson-500 bg-crimson-500/10 shadow-[0_0_10px_rgba(183,28,28,0.2)]">SPACE</div>
            <span className="text-[10px] mt-2 text-crimson-500 tracking-widest uppercase">击碎障碍与幽灵</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
