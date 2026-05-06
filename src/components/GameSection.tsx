import React, { useState, useRef, useEffect } from 'react';
import { Music, AlertTriangle, Disc3, RefreshCw, Play } from 'lucide-react';
import { analyzeAudio, GameNote } from '../lib/audioAnalysis';
import GameCanvas from './GameCanvas';
import { songs } from '../data';

type ScreenState = 'menu' | 'analyzing' | 'ready' | 'countdown' | 'playing' | 'gameover';

export default function GameSection() {
  const [screen, setScreen] = useState<ScreenState>('menu');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [notes, setNotes] = useState<GameNote[]>([]);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);
  
  const [finalScore, setFinalScore] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [trackName, setTrackName] = useState('Custom Track');

  const audioCtxRef = useRef<AudioContext | null>(null);

  const processAudioBuffer = async (arrayBuffer: ArrayBuffer) => {
    try {
      const ctx = new window.AudioContext();
      audioCtxRef.current = ctx;
      
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);

      setTimeout(() => {
        const generatedNotes = analyzeAudio(buffer);
        setNotes(generatedNotes);
        setScreen('ready');
      }, 50);
    } catch (err) {
      console.error(err);
      setError('处理音频失败，请重试。');
      setScreen('menu');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTrackName(file.name.replace(/\.[^/.]+$/, ""));
    setError('');
    setScreen('analyzing');

    try {
      const arrayBuffer = await file.arrayBuffer();
      await processAudioBuffer(arrayBuffer);
    } catch (err) {
      console.error(err);
      setError('无法读取文件。');
      setScreen('menu');
    }
  };

  const handlePresetSelect = async (url: string, title: string) => {
    setTrackName(title);
    setError('');
    setScreen('analyzing');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('网络请求失败');
      const arrayBuffer = await response.arrayBuffer();
      await processAudioBuffer(arrayBuffer);
    } catch (err) {
      console.error(err);
      setError('无法加载该曲目，请检查网络或尝试自己上传。');
      setScreen('menu');
    }
  };

  const handleStart = async () => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    setCountdown(3);
    setScreen('countdown');
  };

  useEffect(() => {
    if (screen === 'countdown') {
      const int = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(int);
            setScreen('playing');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(int);
    }
  }, [screen]);

  const handleGameOver = (score: number, combo: number) => {
    setFinalScore(score);
    setMaxCombo(combo);
    setScreen('gameover');
  };

  const handleRestart = () => {
    setScreen('ready');
  };

  const handleNewSong = () => {
    setAudioBuffer(null);
    setNotes([]);
    setScreen('menu');
  };

  return (
    <div className="w-full flex-1 flex flex-col relative font-serif rounded-xl overflow-hidden min-h-[600px] border border-gold-500/20 mt-10">
      
      <div className="absolute inset-0 bg-gradient-to-b from-velvet via-onyx to-black opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 70%)' }}></div>
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/40 to-transparent"></div>

      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-6">
        
        {screen === 'menu' && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 flex flex-col items-center w-full max-w-4xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
              
              <div className="flex flex-col gap-4 border-r-0 md:border-r border-gold-500/20 pr-0 md:pr-8">
                <h3 className="text-xl italic text-gold-500 font-serif mb-4 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 fill-current"/> 经典预设曲目
                </h3>
                <div className="flex flex-col gap-3">
                  {songs.filter(s => s.audioUrl).map(song => (
                    <button 
                      key={song.id}
                      onClick={() => handlePresetSelect(song.audioUrl!, song.title)}
                      className="group flex items-center justify-between p-4 border border-gold-500/20 hover:border-crimson-500 hover:bg-crimson-500/10 transition-all text-left bg-onyx/50 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                    >
                      <div>
                        <div className="text-[#f5f2ed] font-serif font-bold group-hover:text-crimson-500 transition-colors">{song.title}</div>
                        <div className="text-gold-500/60 font-sans text-xs mt-1 uppercase tracking-widest">{song.singer}</div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-gold-500/40 flex items-center justify-center text-gold-500 group-hover:bg-crimson-500 group-hover:text-white group-hover:border-crimson-500 transition-colors">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gold-500/40 font-sans text-center">
                  注：受版权限制，预设曲目仅供 30 秒片段。如需体验完整音游，强烈建议您可以点击右侧上传完整的歌曲文件。
                </p>
              </div>

              <div className="flex flex-col items-center justify-center pl-0 md:pl-8 py-8 md:py-0">
                <h3 className="text-xl italic text-gold-500 font-serif mb-8 select-none">或</h3>
                
                <label className="relative inline-flex items-center justify-center cursor-pointer group w-full">
                  <div className="absolute inset-0 bg-gold-500 blur-[15px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative w-full flex items-center justify-center gap-4 px-8 py-6 bg-gold-500 text-onyx font-sans font-bold uppercase tracking-tighter hover:bg-white hover:text-onyx transition-colors skew-x-[-12deg] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    <span className="inline-flex items-center gap-3 skew-x-[12deg]">
                      <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                      <Music className="w-5 h-5" />
                      上传自定义曲目
                    </span>
                  </div>
                </label>
                <p className="mt-8 text-gold-500/50 max-w-sm mx-auto font-sans text-xs uppercase tracking-widest leading-loose">
                  支持 MP3/WAV <br/> AI 将自动生成专属节奏关卡
                </p>
              </div>

            </div>

            {error && (
              <div className="mt-8 p-4 bg-crimson-500/10 border border-crimson-500/30 text-crimson-500 rounded font-sans text-sm tracking-wide flex items-center gap-3 shadow-[0_0_10px_rgba(183,28,28,0.2)]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {screen === 'analyzing' && (
          <div className="text-center flex flex-col items-center">
            <Disc3 className="w-16 h-16 text-gold-500 animate-spin mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            <h2 className="text-2xl italic text-[#f5f2ed] mb-2">正在生成谱面...</h2>
            <p className="text-crimson-500 font-sans text-xs uppercase tracking-widest">分析音频结构中</p>
          </div>
        )}

        {screen === 'ready' && (
          <div className="text-center w-full max-w-2xl bg-onyx/80 p-12 border border-gold-500/20 shadow-[0_0_40px_rgba(212,175,55,0.05)] backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-crimson-500 opacity-10 blur-[50px]"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500 opacity-10 blur-[50px]"></div>
            
            <span className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-2 font-sans font-bold block relative z-10">Stage Set</span>
            <h2 className="text-4xl font-serif font-black tracking-widest mb-10 text-[#f5f2ed] relative z-10">
              准备<span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-500 to-crimson-700 ml-4">战斗</span>
            </h2>

            <div className="grid grid-cols-2 gap-8 text-left font-sans text-sm tracking-wider mb-12 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gold-500/40 rounded flex items-center justify-center font-sans font-bold text-gold-500 bg-onyx">↑</div>
                <span className="text-gold-500/80">跳跃 (跳过地刺/鬼火)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-gold-500/40 rounded flex items-center justify-center font-sans font-bold text-gold-500 bg-onyx">↓</div>
                <span className="text-gold-500/80">下蹲 (躲避铡刀)</span>
              </div>
              
              <div className="col-span-2 flex justify-center items-center gap-4 mt-6 pt-8 border-t border-gold-500/10">
                <div className="w-32 h-10 border border-crimson-500 rounded flex items-center justify-center font-sans font-bold text-crimson-500 bg-crimson-500/10 shadow-[0_0_15px_rgba(183,28,28,0.3)]">空格键</div>
                <span className="text-crimson-500 font-bold tracking-widest">打怪 / 撞裂石墙</span>
              </div>
            </div>

            <button onClick={handleStart} className="relative z-10 px-12 py-4 bg-gold-500 text-onyx font-sans font-bold uppercase tracking-tighter hover:bg-white hover:text-onyx transition-colors skew-x-[-12deg] shadow-[0_0_20px_rgba(212,175,55,0.3)] group inline-block">
              <span className="inline-block skew-x-[12deg] group-hover:scale-105 transition-transform">进入舞台</span>
            </button>
          </div>
        )}

        {screen === 'countdown' && (
          <div className="text-center">
            <h2 className="text-[150px] font-black text-crimson-500 italic drop-shadow-[0_0_30px_rgba(183,28,28,0.6)] animate-pulse">
              {countdown}
            </h2>
          </div>
        )}

        {screen === 'playing' && audioBuffer && audioCtxRef.current && (
           <div className="w-full h-full flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500">
              <GameCanvas 
                audioBuffer={audioBuffer} 
                audioCtx={audioCtxRef.current} 
                notes={notes} 
                trackName={trackName}
                onGameOver={handleGameOver} 
              />
           </div>
        )}

        {screen === 'gameover' && (
          <div className="text-center w-full max-w-2xl bg-onyx/80 p-12 border border-gold-500/20 shadow-[0_0_40px_rgba(212,175,55,0.05)] backdrop-blur-md relative overflow-hidden">
            <span className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-2 font-sans font-bold block relative z-10">Performance Complete</span>
            <h2 className="text-5xl font-serif font-black tracking-widest mb-12 text-[#f5f2ed] relative z-10">谢幕</h2>

            <div className="flex justify-center gap-16 mb-12 relative z-10">
              <div className="text-right">
                <p className="text-gold-500/50 text-xs uppercase tracking-widest font-sans mb-1">总分</p>
                <p className="text-4xl font-mono font-bold text-gold-500">{finalScore.toLocaleString()}</p>
              </div>
              <div className="text-left">
                <p className="text-crimson-500/70 text-xs uppercase tracking-widest font-sans mb-1">最高连击</p>
                <p className="text-4xl font-mono font-bold text-crimson-500">{maxCombo}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <button onClick={handleRestart} className="flex items-center justify-center gap-3 px-8 py-3 border border-gold-500/40 text-gold-500 hover:bg-gold-500/10 font-sans font-bold uppercase tracking-widest transition-colors skew-x-[-12deg]">
                <span className="inline-flex items-center gap-2 skew-x-[12deg]"><RefreshCw className="w-4 h-4" /> 重新开始</span>
              </button>
              <button onClick={handleNewSong} className="flex items-center justify-center gap-3 px-8 py-3 bg-crimson-500 text-white hover:bg-white hover:text-onyx font-sans font-bold uppercase tracking-widest transition-colors skew-x-[-12deg] shadow-[0_0_15px_rgba(183,28,28,0.3)]">
                <span className="inline-flex items-center gap-2 skew-x-[12deg]"><Music className="w-4 h-4" /> 新曲目</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
