import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { gallery } from '../data';

export default function GallerySection() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <section id="gallery" className="relative py-32 bg-onyx min-h-screen border-t border-gold-500/10 overflow-hidden flex flex-col justify-center">
      <div className="absolute inset-0 bg-[#020202] z-0"></div>
      
      <div className="text-center z-10 block mb-20 px-6">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
          className="text-gold-500 font-sans text-sm font-bold uppercase tracking-[0.4em] block mb-4"
        >
          The Stage
        </motion.span>
        <motion.h2 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.1 }}
           className="text-5xl md:text-7xl font-serif font-black tracking-widest text-[#f5f2ed] drop-shadow-[0_0_15px_rgba(212,175,55,0.1)]"
        >
          华丽<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-700 ml-4">剧照</span>
        </motion.h2>
      </div>

      <div className="relative z-10 px-6 max-w-[1400px] mx-auto w-full h-[60vh] md:h-[80vh] flex gap-4 md:gap-8 justify-center overflow-hidden">
        {/* Column 1 */}
        <motion.div style={{ y: y1 }} className="flex flex-col gap-4 md:gap-8 w-1/3 mt-12 md:mt-24">
          <GalleryImage src={gallery[0]} />
          <GalleryImage src={gallery[3]} />
        </motion.div>
        
        {/* Column 2 */}
        <motion.div style={{ y: y2 }} className="flex flex-col gap-4 md:gap-8 w-1/3 -mt-[10vh]">
          <GalleryImage src={gallery[1]} />
          <GalleryImage src={gallery[4]} />
          <GalleryImage src={gallery[0]} />
        </motion.div>
        
        {/* Column 3 */}
        <motion.div style={{ y: y3 }} className="flex flex-col gap-4 md:gap-8 w-1/3 mt-24 md:mt-48">
          <GalleryImage src={gallery[2]} />
          <GalleryImage src={gallery[1]} />
        </motion.div>
      </div>
      
      {/* Gradients to fade out top and bottom of masonry */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#020202] to-transparent z-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020202] to-transparent z-20 pointer-events-none"></div>
    </section>
  );
}

function GalleryImage({ src }: { src: string }) {
  return (
    <div className="relative overflow-hidden group rounded-[2px] bg-velvet border border-gold-500/10">
      <div className="absolute inset-0 bg-gold-500 mix-blend-color opacity-20 group-hover:opacity-0 transition-opacity duration-700 z-10"></div>
      <img src={src} alt="Gallery" className="w-full h-full object-cover object-center aspect-[3/4] filter grayscale-[0.8] contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
    </div>
  )
}
