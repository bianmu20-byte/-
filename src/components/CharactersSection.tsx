import React from 'react';
import { motion } from 'motion/react';
import { characters } from '../data';

export default function CharactersSection() {
  return (
    <section id="characters" className="py-24 px-6 md:px-12 bg-onyx min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-crimson-500 font-sans text-sm font-bold uppercase tracking-[0.3em] block mb-2">The Cast</span>
          <h2 className="text-5xl md:text-6xl font-serif font-black tracking-widest text-[#f5f2ed] drop-shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            灵魂<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-700 ml-4">人物</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {characters.map((char, index) => (
            <motion.div 
              key={char.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              whileHover={{ y: -10 }}
              className={`group relative overflow-hidden bg-velvet border border-gold-500/10 hover:border-gold-500/40 transition-all duration-500 shadow-xl ${index % 2 !== 0 ? 'md:mt-16' : ''}`}
            >
              <div className="aspect-[4/3] w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/50 to-transparent z-10"></div>
                <img 
                  src={char.image} 
                  alt={char.name} 
                  className="w-full h-full object-cover select-none object-center group-hover:scale-105 filter contrast-125 sepia-[0.2] transition-transform duration-700 opacity-70 group-hover:opacity-100"
                />
                
                <div className="absolute bottom-0 left-0 p-8 z-20 w-full transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-crimson-500 font-sans text-xs font-bold uppercase tracking-widest block mb-3">{char.role}</span>
                  <h3 className="text-4xl italic font-serif text-white mb-4 drop-shadow-md">{char.name}</h3>
                  <div className="w-10 h-[1px] bg-gold-500/50 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
                  <p className="text-[#f5f2ed]/70 font-sans text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
                    {char.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
