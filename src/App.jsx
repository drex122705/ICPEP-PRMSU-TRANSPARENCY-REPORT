import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import Lenis from '@studio-freight/lenis';
import { MotherboardScene } from './Scene';
import { Dashboard } from './Dashboard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Set up GSAP animations for HTML overlays
    const texts = gsap.utils.toArray('.scroll-text');
    texts.forEach((text, i) => {
      gsap.fromTo(text,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: text,
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      lenis.destroy();
      cancelAnimationFrame(rafId);
    }
  }, []);

  return (
    <div className="relative w-full bg-prmsu-deep/30 text-slate-100 font-sans selection:bg-prmsu-cyan selection:text-slate-950">

      {/* 3D Canvas Background (Fixed) */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <Canvas shadows camera={{ position: [0, -35, 75], fov: 55 }}>
          <color attach="background" args={['#010a18']} />
          <fog attach="fog" args={['#010a18', 10, 150]} />
          <MotherboardScene />
        </Canvas>

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#010a18_120%)] pointer-events-none"></div>
      </div>

      {/* HTML Content Overlay */}
      <div className="relative z-10 w-full pointer-events-none">

        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-prmsu-royal via-prmsu-cyan to-prmsu-gold p-0.5 shadow-2xl shadow-cyan-500/30 mb-6 flex items-center justify-center transform hover:scale-105 transition-transform backdrop-blur-md pointer-events-auto">
            <div className="w-full h-full bg-[#02132b] rounded-2xl flex flex-col items-center justify-center p-2 text-center border border-cyan-400/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#00C0F3_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-prmsu-cyan mb-1 animate-pulse"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
              <span className="font-mono text-[9px] tracking-wider text-prmsu-cyan font-bold">CpE • ICpEP</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-prmsu-navy/90 border border-prmsu-cyan/40 text-prmsu-cyan text-xs sm:text-sm font-mono tracking-widest uppercase mb-4 shadow-xl backdrop-blur-md pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-prmsu-cyan animate-ping"></span>
            <span>President Ramon Magsaysay State University</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] font-heading">
            ICPEP PRMSU
          </h1>

          <div className="mt-2 text-2xl sm:text-3xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-prmsu-cyan via-amber-200 to-prmsu-gold tracking-wider drop-shadow-lg">
            “We Serve You”
          </div>

          <p className="mt-4 text-xs sm:text-sm text-cyan-200/80 font-mono tracking-wider max-w-xl">
            Official Financial Transparency & Public Accountability Portal • CpE Student Org Treasury
          </p>

          <div className="mt-20 text-slate-400 animate-bounce">
            <span className="text-sm font-mono uppercase tracking-widest">Scroll to Initialize</span>
            <br/>↓
          </div>
        </section>

        {/* Scroll Journey Sections */}
        <section className="h-screen flex items-center px-10 md:px-24">
          <div className="max-w-xl scroll-text pointer-events-auto">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">
              Real-Time <span className="text-prmsu-cyan">Data Processing</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Experience unparalleled transparency. Our system processes financial data in real-time, syncing seamlessly with your records to provide an accurate, up-to-the-minute overview of treasury operations.
            </p>
          </div>
        </section>

        <section className="h-screen flex items-center justify-end px-10 md:px-24">
          <div className="max-w-xl text-right scroll-text pointer-events-auto">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">
              Automated <span className="text-prmsu-gold">Discrepancy Checks</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              The internal engine cross-references transaction codes and detects duplicate references or underpayments automatically, ensuring absolute accountability and trust in our student organization.
            </p>
          </div>
        </section>

      </div>

      {/* Dashboard Section (Below the 3D Experience) */}
      <div className="relative z-20 bg-prmsu-deep/60 backdrop-blur-md border-t-4 border-prmsu-cyan">
        <Dashboard />
      </div>

    </div>
  );
}
