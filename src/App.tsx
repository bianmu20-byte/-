import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import GameSection from './components/GameSection';
import CharactersSection from './components/CharactersSection';
import SongsSection from './components/SongsSection';
import StorySection from './components/StorySection';
import GallerySection from './components/GallerySection';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      if (!isMuted) {
        audioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-onyx text-[#f5f2ed] selection:bg-crimson-500 selection:text-white font-serif overflow-x-hidden">
      
      {/* Background Audio (Placeholder for Rock Mozart song) */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=rock-trailer-103632.mp3" 
      />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-onyx/80 backdrop-blur-md border-b border-gold-500/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black italic tracking-tighter cursor-pointer" onClick={() => scrollToSection('hero')}>
            摇滚 <span className="text-crimson-500">莫扎特</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 font-sans text-sm font-bold tracking-widest uppercase">
            <button onClick={() => scrollToSection('story')} className="text-[#f5f2ed]/70 hover:text-gold-500 transition-colors">起源</button>
            <button onClick={() => scrollToSection('gallery')} className="text-[#f5f2ed]/70 hover:text-gold-500 transition-colors">剧照</button>
            <button onClick={() => scrollToSection('characters')} className="text-[#f5f2ed]/70 hover:text-gold-500 transition-colors">人物</button>
            <button onClick={() => scrollToSection('songs')} className="text-[#f5f2ed]/70 hover:text-gold-500 transition-colors">音乐</button>
            <button onClick={() => scrollToSection('game')} className="text-crimson-500 hover:text-white transition-colors">互动体验</button>
            
            <button onClick={handleToggleMute} className="text-gold-500 hover:text-white transition-colors p-2 border border-gold-500/20 rounded-full h-10 w-10 flex items-center justify-center">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <button className="lg:hidden text-gold-500" onClick={() => setIsMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-velvet flex flex-col items-center justify-center">
          <button className="absolute top-6 right-6 text-gold-500" onClick={() => setIsMenuOpen(false)}>
            <X className="w-8 h-8" />
          </button>
          <div className="flex flex-col items-center gap-8 font-sans text-xl font-bold tracking-widest uppercase">
             <button onClick={() => scrollToSection('hero')} className="text-[#f5f2ed] hover:text-gold-500">首页</button>
             <button onClick={() => scrollToSection('story')} className="text-[#f5f2ed] hover:text-gold-500">起源</button>
             <button onClick={() => scrollToSection('gallery')} className="text-[#f5f2ed] hover:text-gold-500">剧照</button>
             <button onClick={() => scrollToSection('characters')} className="text-[#f5f2ed] hover:text-gold-500">人物</button>
             <button onClick={() => scrollToSection('songs')} className="text-[#f5f2ed] hover:text-gold-500">音乐</button>
             <button onClick={() => scrollToSection('game')} className="text-crimson-500">互动体验</button>
             <button onClick={handleToggleMute} className="text-gold-500 flex items-center gap-2 mt-4">
               {isMuted ? <><VolumeX className="w-5 h-5" /> 取消静音</> : <><Volume2 className="w-5 h-5" /> 静音</>}
             </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-onyx/40 via-onyx/80 to-onyx z-10"></div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/213983_fr_dsc07688.jpg" alt="Concert Stage" className="w-full h-full object-cover object-center opacity-40 grayscale mix-blend-luminosity" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.span 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="text-gold-500 font-sans text-sm md:text-base font-bold uppercase tracking-[0.5em] block mb-6"
          >
            Le Spectacle Musical
          </motion.span>
          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
             className="text-6xl md:text-8xl lg:text-9xl font-serif font-black tracking-widest mb-8 drop-shadow-[0_0_30px_rgba(255,0,85,0.3)]"
          >
            摇滚<span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-500 to-gold-500 ml-2 md:ml-4">莫扎特</span>
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
             className="text-[#f5f2ed]/80 font-sans text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
          >
            感受古典与摇滚的激烈碰撞。当旷世奇才遇见电吉他，一场跨越世纪的华丽反叛就此开演。
          </motion.p>
          <motion.button 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
             onClick={() => scrollToSection('game')} 
             className="relative inline-flex items-center justify-center px-12 py-5 bg-crimson-500 text-white font-sans font-bold uppercase tracking-widest skew-x-[-12deg] shadow-[0_0_20px_rgba(183,28,28,0.4)] hover:bg-white hover:text-black transition-all group"
          >
             <span className="inline-block skew-x-[12deg] group-hover:scale-105 transition-transform">立刻体验节奏大师</span>
          </motion.button>
        </div>
      </section>

      <StorySection />
      <GallerySection />
      <CharactersSection />
      <SongsSection />

      {/* Game Section */}
      <section id="game" className="py-24 px-6 md:px-12 bg-onyx min-h-screen flex flex-col border-t border-gold-500/10">
         <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center mb-6"
            >
              <span className="text-crimson-500 font-sans text-sm font-bold uppercase tracking-[0.3em] block mb-2">Interactive Experience</span>
              <h2 className="text-4xl md:text-5xl font-serif font-black tracking-widest text-[#f5f2ed] mb-4">
                专属<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-700 ml-4">节奏战场</span>
              </h2>
              <p className="text-[#f5f2ed]/60 font-sans max-w-xl mx-auto leading-relaxed">
                上传你最爱的摇滚莫扎特原声带，让 AI 为你生成专属节奏谱面。拿起吉他，开始你的表演！
              </p>
            </motion.div>
            
            <GameSection />
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#020202] border-t border-gold-500/10 text-center flex flex-col items-center">
        <div className="text-2xl font-black italic tracking-tighter mb-6 text-[#f5f2ed]/50">
           摇滚 <span className="text-crimson-500/50">莫扎特</span>
        </div>
        <p className="text-[#f5f2ed]/40 font-sans text-xs uppercase tracking-widest">
          ROCK MOZART FAN PORTAL &copy; 2026. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
