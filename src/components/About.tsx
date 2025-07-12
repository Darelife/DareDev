'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import ScrollVelocity from './ScrollVelocity';

const About = () => {
  const imageRef = useRef(null);
  const infoRef = useRef(null);
  const isImageInView = useInView(imageRef, { amount: 0.3 });
  const isInfoInView = useInView(infoRef, { amount: 0.3 });

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <ScrollVelocity texts={["About Me"]} />
        <div className="mt-12 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Image Box - Hidden on screens smaller than md */}
          <motion.div 
            ref={imageRef}
            className="hidden md:block md:w-1/3 lg:w-1/4"
            initial={{ opacity: 0, x: -50 }}
            animate={isImageInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="aspect-square bg-gray-800/30 border border-red-500/20 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/10">
              <span className="text-gray-500 text-lg font-mono">My_Image.jpg</span>
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div 
            ref={infoRef}
            className="w-full md:flex-1"
            initial={{ opacity: 0, y: 50 }}
            animate={isInfoInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <div className="bg-gray-900/50 border border-red-500/20 p-6 sm:p-8 rounded-lg shadow-2xl shadow-red-500/10 backdrop-blur-sm">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-red-400 drop-shadow-[0_0_4px_rgba(255,0,0,0.5)]">My Info</h3>
              <p className="text-gray-300 leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum vitae mollitia provident assumenda odit. Unde tempora a tenetur dolores quasi labore assumenda nam magnam, sint nobis non laborum quae eveniet modi doloremque. Vitae enim recusandae corporis quam laboriosam repellendus quasi veniam architecto expedita pariatur officiis, asperiores odio, iure nesciunt debitis?
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
