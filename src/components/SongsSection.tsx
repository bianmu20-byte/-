import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { songs } from '../data';
import { Play, Square, Disc3 } from 'lucide-react';

export default function SongsSection() {
  const [activeSong, setActiveSong] = useState(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [activeSong]);

  const togglePlay = () => {
    if (!activeSong.audioUrl) return;

    if (!audioRef.current || audioRef.current.src !== activeSong.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(activeSong.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Pause global background audio if playing
      const bgAudio = document.getElementById('bg-audio') as HTMLAudioElement;
      if (bgAudio && !bgAudio.paused) {
        bgAudio.pause();
        // optionally update the global state, but pausing directly works.
      }
      
      audioRef.current.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  };

  return (
    <section id="songs" className="py-24 px-6 md:px-12 bg-onyx min-h-screen flex flex-col justify-center border-t border-gold-500/10 border-b border-gold-500/10 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-crimson-700 opacity-20 blur-[150px] rounded-full pointer-events-none transform -translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto w-full z-10 relative">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mb-16 text-right"
        >
          <span className="text-crimson-500 font-sans text-sm font-bold uppercase tracking-[0.3em] block mb-2">The Music</span>
          <h2 className="text-5xl md:text-6xl font-serif font-black tracking-widest text-[#f5f2ed] drop-shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            原声<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-700 ml-4">音乐</span>
          </h2>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Song List */}
          <div className="flex-1 flex flex-col gap-4">
            {songs.map((song, index) => (
              <motion.button 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={song.id} 
                className={`text-left p-6 flex flex-col gap-2 transition-all duration-300 border-l-4 ${activeSong.id === song.id ? 'border-crimson-500 bg-crimson-500/5' : 'border-transparent hover:border-gold-500/40 hover:bg-gold-500/5'}`}
                onClick={() => setActiveSong(song)}
              >
                <div className="flex justify-between items-center w-full">
                  <h3 className={`text-2xl font-serif italic ${activeSong.id === song.id ? 'text-crimson-500 drop-shadow-md' : 'text-white'}`}>
                    {song.title}
                  </h3>
                  {activeSong.id === song.id && <Disc3 className={`w-5 h-5 text-crimson-500 ${isPlaying ? 'animate-spin' : ''}`} />}
                </div>
                <span className="text-gold-500/60 font-sans text-xs uppercase tracking-widest">{song.singer}</span>
              </motion.button>
            ))}
          </div>

          {/* Active Song Details */}
          <div className="flex-1 bg-velvet border border-gold-500/20 p-8 md:p-12 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500 opacity-5 blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                 key={activeSong.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.4 }}
                 className="relative z-10"
              >
                <span className="text-crimson-500 font-sans text-xs font-bold uppercase tracking-widest block mb-4">当前选中</span>
                <h3 className="text-4xl italic font-serif text-white mb-2">{activeSong.title}</h3>
                <p className="text-gold-500 font-sans text-sm tracking-wider mb-8">演唱: {activeSong.singer}</p>
                
                <p className="text-[#f5f2ed]/80 font-serif leading-relaxed mb-8 text-lg">
                  {activeSong.description}
                </p>

                <div className="mb-8">
                  <span className="text-gold-500/40 font-sans text-[10px] uppercase tracking-widest block mb-4 border-b border-gold-500/10 pb-2">Lyrics Snippet</span>
                  <p className="font-serif italic text-lg text-[#f5f2ed]/60 whitespace-pre-line leading-loose border-l-2 border-crimson-500/30 pl-4">
                    "{activeSong.lyrics}"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <button 
              onClick={togglePlay}
              className={`self-start flex items-center gap-3 px-8 py-3 bg-transparent border ${isPlaying ? 'border-crimson-500 text-crimson-500 hover:bg-crimson-500' : 'border-gold-500 text-gold-500 hover:bg-gold-500'} hover:text-onyx transition-colors font-sans font-bold uppercase tracking-widest skew-x-[-12deg] z-10`}
            >
               <span className="inline-flex items-center gap-2 skew-x-[12deg]">
                 {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />} 
                 {isPlaying ? '停止播放' : '试听片段'}
               </span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
