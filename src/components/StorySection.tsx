import React from 'react';
import { motion } from 'motion/react';
import { story } from '../data';

export default function StorySection() {
  return (
    <section id="story" className="relative py-32 px-6 md:px-12 bg-onyx min-h-screen flex items-center justify-center overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-velvet opacity-30 blur-[150px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold-700 opacity-10 blur-[150px] rounded-full pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center z-10 relative">
        {/* Text Column */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="order-2 lg:order-1"
        >
          <span className="text-gold-500 font-sans text-xs md:text-sm font-bold uppercase tracking-[0.4em] block mb-4">
            The Synopsis
          </span>
          <h2 className="text-5xl md:text-7xl font-serif font-black tracking-widest text-[#f5f2ed] mb-8 leading-tight">
            经典<span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-500 to-crimson-700 ml-4 drop-shadow-[0_0_15px_rgba(183,28,28,0.4)]">重塑</span>
          </h2>
          <div className="w-20 h-[2px] bg-gold-500/50 mb-10"></div>
          <p className="text-[#f5f2ed]/80 font-serif text-lg md:text-xl leading-loose">
            {story.content}
          </p>
        </motion.div>

        {/* Image Column */}
        <div className="order-1 lg:order-2 relative h-[500px] md:h-[700px] w-full">
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, ease: "easeOut" }}
             className="absolute inset-0 right-8 bottom-8 z-20 border border-gold-500/20 overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-velvet/60 to-transparent z-10 mix-blend-multiply"></div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/09/Mikelangelo_Loconte_Claire_P%C3%A9rot_Mozart_l%27op%C3%A9ra_rock.jpg" 
              alt="Theatrical expression" 
              className="w-full h-full object-cover object-center filter contrast-125 sepia-[0.3]"
            />
          </motion.div>
          
          {/* Offset accent square */}
          <motion.div 
             initial={{ opacity: 0, x: -20, y: -20 }}
             whileInView={{ opacity: 1, x: 0, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
             className="absolute top-8 left-8 bottom-0 right-0 border border-crimson-500/40 z-10"
          ></motion.div>
        </div>
      </div>
    </section>
  );
}
