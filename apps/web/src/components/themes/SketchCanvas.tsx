'use client';

import { useEffect, useRef } from 'react';

/** Decoration only: navigation and content always remain in the DOM. */
export default function SketchCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, visible = false, width = 0, height = 0;
    const pointer = { x: 0, y: 0 };
    const draw = (time: number) => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(width / 560, height / 520);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.2;
      const t = reduced.matches ? 0 : time / 1800;
      // Broken orbital paths make the drawing feel like pencil on paper.
      ctx.strokeStyle = '#b4ad9e'; ctx.setLineDash([5, 10]);
      ctx.beginPath(); ctx.ellipse(280, 268, 229, 146, -0.45, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      const star = (x: number, y: number, r: number, color: string) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.12); ctx.beginPath();
        for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2; const radius = i % 2 ? r * 0.43 : r; const px = Math.cos(a) * radius, py = Math.sin(a) * radius; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
        ctx.closePath(); ctx.fillStyle = color; ctx.strokeStyle = '#292821'; ctx.fill(); ctx.stroke(); ctx.restore();
      };
      const count = width < 400 ? 5 : 9;
      for (let i = 0; i < count; i++) { const a = i * Math.PI * 2 / count + t * 0.06; star(280 + Math.cos(a) * 225, 268 + Math.sin(a) * 164, i % 3 === 0 ? 16 : 8, i % 2 ? '#f5cf54' : '#f7f2e6'); }
      ctx.save(); ctx.translate(276 + pointer.x * 12, 253 + Math.sin(t) * 9 + pointer.y * 10); ctx.rotate(0.38);
      ctx.strokeStyle = '#292821'; ctx.fillStyle = '#ed775b';
      ctx.beginPath(); ctx.moveTo(-27, 70); ctx.quadraticCurveTo(-33, 134 + Math.sin(t * 3) * 12, 0, 159); ctx.quadraticCurveTo(36, 126, 27, 70); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f5cf54'; ctx.beginPath(); ctx.moveTo(-13, 73); ctx.quadraticCurveTo(-12, 117, 0, 130); ctx.quadraticCurveTo(16, 110, 13, 73); ctx.fill();
      ctx.fillStyle = '#284bc1';
      ctx.beginPath(); ctx.moveTo(-35, 4); ctx.lineTo(-80, 73); ctx.lineTo(-34, 61); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(35, 4); ctx.lineTo(80, 73); ctx.lineTo(34, 61); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fffdf5'; ctx.beginPath(); ctx.moveTo(0, -135); ctx.bezierCurveTo(-58, -82, -47, 22, -32, 82); ctx.lineTo(32, 82); ctx.bezierCurveTo(47, 22, 58, -82, 0, -135); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ed775b'; ctx.beginPath(); ctx.moveTo(0, -135); ctx.quadraticCurveTo(-25, -112, -33, -75); ctx.quadraticCurveTo(0, -66, 33, -75); ctx.quadraticCurveTo(23, -113, 0, -135); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c4dce7'; ctx.beginPath(); ctx.arc(0, -29, 23, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#fffdf5'; ctx.beginPath(); ctx.arc(0, -29, 15, Math.PI, Math.PI * 1.5); ctx.stroke();
      ctx.strokeStyle = '#292821'; ctx.beginPath(); ctx.moveTo(-30, 66); ctx.lineTo(30, 66); ctx.stroke();
      ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#292821'; ctx.fillText('DL—01', 0, 33); ctx.restore();
      // Small hand-drawn planet and orbit.
      ctx.save(); ctx.translate(99, 114); ctx.rotate(-0.35); ctx.fillStyle = '#f5cf54'; ctx.strokeStyle = '#292821'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 37, 9, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      ctx.font = 'italic 18px Georgia, serif'; ctx.fillStyle = '#284bc1'; ctx.fillText('next stop: the good stuff', 230, 465);
      ctx.restore();
      if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(draw);
    };
    const restart = () => { cancelAnimationFrame(frame); frame = 0; if (visible && !document.hidden) draw(performance.now()); };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width; height = entry.contentRect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); restart();
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); });
    const move = (event: PointerEvent) => { if (reduced.matches || event.pointerType === 'touch') return; const r = canvas.getBoundingClientRect(); pointer.x = (event.clientX - r.left) / r.width - 0.5; pointer.y = (event.clientY - r.top) / r.height - 0.5; };
    const leave = () => { pointer.x = 0; pointer.y = 0; };
    resize.observe(canvas); observer.observe(canvas);
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', restart); reduced.addEventListener('change', restart);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', restart); reduced.removeEventListener('change', restart); };
  }, []);
  return <canvas ref={ref} className="sketch-canvas" aria-hidden="true" />;
}
