'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import ScrollVelocity from './ScrollVelocity';

const mono = { fontFamily: "'Ubuntu Mono', monospace" };
const inter = { fontFamily: 'var(--font-inter), Inter, sans-serif' };

const FACTS = [
  { key: 'location', val: 'BITS Pilani, Goa' },
  { key: 'degree', val: 'B.E. Computer Science' },
  { key: 'cf_rating', val: '1635 peak' },
  { key: 'coding_since', val: '2020' },
  { key: 'languages', val: 'Python · C++ · JS · GoLang' },
  { key: 'hobbies', val: 'Guitar · Cubing · Prog' },
];

function useVisible(amount = 0.15) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  return { ref, inView };
}

export default function About() {
  const { ref: sectionRef, inView: sectionVisible } = useVisible(0.05);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-black text-white overflow-hidden py-20 sm:py-28"
    >
      {/* ── Ambient bottom glow ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-96"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(220,38,38,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── Big decorative ghost text ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
        aria-hidden="true"
      >
        <motion.span
          className="font-black text-white leading-none whitespace-nowrap"
          style={{ fontSize: 'clamp(6rem, 22vw, 18rem)', ...inter, letterSpacing: '-0.04em' }}
          initial={{ opacity: 0 }}
          animate={sectionVisible ? { opacity: 0.025 } : { opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        >
          PRAKHAR
        </motion.span>
      </div>

      {/* ── ScrollVelocity Heading ── */}
      <ScrollVelocity
        texts={['About Me']}
        decelerationFactor={0.93}
        stopThreshold={0.08}
        scrollDebounceTime={80}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 mt-16 sm:mt-20">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* LEFT — Image + facts */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -30 }}
            animate={sectionVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {/* Profile image */}
            <div className="relative max-w-xs mx-auto lg:mx-0 w-full group">
              {/* Offset red shadow */}
              <motion.div
                className="absolute inset-0 rounded-sm"
                style={{ background: 'rgba(220,38,38,0.15)' }}
                initial={{ x: 0, y: 0 }}
                animate={{ x: 10, y: 10 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              />

              {/* Image */}
              <div
                className="relative aspect-square overflow-hidden rounded-sm border border-red-500/30 transition-shadow duration-500"
                style={{ boxShadow: '0 0 40px rgba(220,38,38,0.08)' }}
              >
                <img
                  src="/favicon.png"
                  alt="Prakhar Bhandari"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {/* Corner vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
                />
                {/* Red hover tint */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'rgba(220,38,38,0.06)' }}
                />
              </div>

              {/* Caption */}
              <div className="mt-3 flex items-center justify-between px-0.5">
                <span className="text-[10px] text-white/22 tracking-widest uppercase" style={mono}>
                  Prakhar Bhandari
                </span>
                <span className="text-[10px] text-red-500/35 tracking-widest" style={mono}>
                  @darelife
                </span>
              </div>
            </div>

            {/* Facts list */}
            <div className="max-w-xs mx-auto lg:mx-0 w-full divide-y divide-white/[0.06]">
              {FACTS.map(({ key, val }, i) => (
                <motion.div
                  key={key}
                  className="flex justify-between items-baseline py-2.5 group cursor-default"
                  initial={{ opacity: 0, x: -10 }}
                  animate={sectionVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.45, ease: 'easeOut' }}
                >
                  <span
                    className="text-[10px] tracking-widest uppercase text-white/22 group-hover:text-red-500/55 transition-colors duration-300"
                    style={mono}
                  >
                    {key}
                  </span>
                  <span
                    className="text-xs text-white/50 group-hover:text-white/80 transition-colors duration-300"
                    style={mono}
                  >
                    {val}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Editorial text */}
          <motion.div
            className="flex flex-col gap-9"
            initial={{ opacity: 0, y: 24 }}
            animate={sectionVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            {/* Label */}
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-red-500/50" />
              <span className="text-[10px] tracking-[0.35em] uppercase text-red-500/55" style={mono}>
                who i am
              </span>
            </div>

            {/* Pull quote */}
            <div>
              <p
                className="font-bold leading-[1.15] text-white"
                style={{ ...inter, fontSize: 'clamp(1.75rem, 4vw, 2.6rem)', letterSpacing: '-0.02em' }}
              >
                I write code that{' '}
                {/* "ships" with animated underline */}
                <span className="relative inline-block" style={{ color: 'rgba(220,38,38,0.85)' }}>
                  ships
                  <motion.span
                    className="absolute bottom-0 left-0 h-[2px] rounded-full"
                    style={{ background: 'rgba(220,38,38,0.6)', boxShadow: '0 0 6px rgba(220,38,38,0.5)' }}
                    initial={{ width: '0%' }}
                    animate={sectionVisible ? { width: '100%' } : {}}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.8 }}
                  />
                </span>
                <span className="text-white/30">,</span>
                <br />
                compete for fun,
                <br />
                and never stop{' '}
                <span className="text-white/35">building.</span>
              </p>

              {/* Blinking cursor after the pull quote */}
              <motion.span
                className="inline-block w-0.5 h-7 bg-red-500/60 ml-1 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear', times: [0, 0.499, 0.5, 1] }}
              />
            </div>

            {/* Body text */}
            <div className="flex flex-col gap-4">
              <p
                className="leading-[1.9] text-white/50"
                style={{ ...inter, fontSize: 'clamp(0.875rem, 1.2vw, 0.975rem)' }}
              >
                Started in 2020 when the pandemic hit. Boredom turned into a Discord bot,
                which turned into a full-blown obsession. Went from Python to C, C++, JavaScript,
                React, and GoLang. Competed on Codeforces, peaked at{' '}
                <span className="text-white/78 font-medium">1635</span>, shipped a browser extension
                to <span className="text-white/78 font-medium">1000+ users</span>, and
                built academic platforms with thousands of monthly visitors.
              </p>
              <p
                className="leading-[1.9] text-white/30"
                style={{ ...inter, fontSize: 'clamp(0.875rem, 1.2vw, 0.975rem)' }}
              >
                Grew up in Kuwait, schooled across Mumbai &amp; Jaipur, now at{' '}
                <span className="text-white/50">BITS Pilani, Goa</span> doing CSE,
                still hungry for the next hard problem.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%)' }} />

            {/* Interests */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] tracking-[0.35em] uppercase text-white/18" style={mono}>
                interests
              </span>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {['Competitive Programming', 'Guitar', 'Cubing', 'Programming'].map((tag, i) => (
                  <motion.span
                    key={tag}
                    className="text-sm text-white/30 hover:text-red-400/65 transition-colors duration-300 cursor-default"
                    style={inter}
                    initial={{ opacity: 0 }}
                    animate={sectionVisible ? { opacity: 1 } : {}}
                    transition={{ delay: 0.55 + i * 0.07, duration: 0.4 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
