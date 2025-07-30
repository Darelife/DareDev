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
        <ScrollVelocity 
          texts={["About Me"]} 
          decelerationFactor={0.93}
          stopThreshold={0.08}
          scrollDebounceTime={80}
        />
        <div className="mt-12 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Image Box - Hidden on screens smaller than md */}
            <motion.div 
            ref={imageRef}
            className="w-full md:w-1/3 lg:w-1/4 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={isImageInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            >
            <div className="aspect-square bg-gray-800/30 border border-red-500/20 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/10 overflow-hidden">
              <img
              src="/favicon.png"
              alt="Profile"
              className="w-full h-full object-cover rounded-none border-2 border-red-400 shadow"
              />
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
                I started coding in 2020 (class 10) when the Covid 19 pandemic started. I coded a discord bot with many functionalities, which made me super interested in coding. I initially began with Python. Now, I also know C, C++, JS, React, & Rust. I’m interested in learning more about machine learning models and the inner workings of computers in depth. My hobbies include competitive programming (Codeforces Peak Rating: 1635), playing guitar, and cubing. I grew up in Kuwait, did my class 9 and 10th in Mumbai, and 11th and 12 in Jaipur, while preparing for JEE mains + adv.
I am now in BITS Pilani, Goa Campus, pursuing CSE.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
