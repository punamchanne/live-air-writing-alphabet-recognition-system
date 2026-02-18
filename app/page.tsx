'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col items-center justify-center p-6 font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="max-w-5xl w-full relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <header className="text-center mb-16 sm:mb-24 scale-up">
          <div className="inline-flex items-center space-x-3 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 mb-8 animate-float">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-ping"></span>
            <span className="text-[10px] font-orbitron font-black text-blue-400 uppercase tracking-[0.3em]">System v2.4 Online</span>
          </div>

          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-orbitron font-black tracking-tighter text-white mb-6 uppercase leading-none">
            Aero <span className="text-blue-500 italic drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">Graph</span> Pro
          </h1>

          <p className="text-base sm:text-lg font-medium text-gray-500 max-w-2xl mx-auto leading-relaxed uppercase tracking-[0.2em]">
            Neural Air-Writing Studio • Low-Latency <span className="text-gray-300">Spatial Recognition</span>
          </p>
        </header>

        {/* Cinematic Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16 w-full">
          {[
            {
              icon: "🛰️",
              title: "Spatial Link",
              desc: "MediaPipe-powered hand tracking at 60FPS.",
              color: "blue"
            },
            {
              icon: "🧠",
              title: "Neural Engine",
              desc: "62-class alphanumeric recognition models.",
              color: "purple"
            },
            {
              icon: "⚡",
              title: "Zero-Lag",
              desc: "Optimized client-side inference pipeline.",
              color: "cyan"
            }
          ].map((item, i) => (
            <div key={i} className="glass group rounded-3xl p-6 sm:p-8 border-white/5 hover:border-blue-500/30 transition-all duration-700 relative overflow-hidden">
              <div className={`absolute -bottom-12 -right-12 w-32 h-32 bg-${item.color}-500/5 rounded-full blur-3xl group-hover:bg-${item.color}-500/10 transition-all duration-1000`}></div>
              <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
              <h3 className="text-base sm:text-lg font-orbitron font-black text-white mb-2 sm:mb-3 uppercase tracking-wider">{item.title}</h3>
              <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed italic">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* High-Fidelity CTA */}
        <div className="text-center group">
          <Link
            href="/air-writing"
            className="relative inline-flex items-center space-x-3 sm:space-x-4 px-8 sm:px-12 py-4 sm:py-6 bg-white text-black font-orbitron font-black text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(59,130,246,0.4)] transition-all duration-700 hover:-translate-y-2 overflow-hidden"
          >
            <span className="relative z-10 text-[10px] sm:text-xs">Initialize Studio</span>
            <span className="relative z-10 text-base sm:text-lg">→</span>
            {/* Hover reflection */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out"></div>
          </Link>
          <div className="mt-8 flex items-center justify-center space-x-4 opacity-30 group-hover:opacity-60 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="w-12 h-[1px] bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>

        {/* Footer HUD */}
        <footer className="mt-24 sm:mt-32 w-full glass p-8 rounded-t-[3rem] border-white/5 text-center flex flex-col items-center">
          <p className="text-[10px] font-orbitron font-black text-gray-600 uppercase tracking-[0.6em] mb-4">
            Research Node 042 • Live Environment
          </p>
          <div className="flex space-x-8 text-[9px] font-black text-blue-500/40 uppercase tracking-widest">
            <span>Next.js 15+</span>
            <span>TF.js v4.0</span>
            <span>MediaPipe Hub</span>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .scale-up {
          animation: scaleUp 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scaleUp {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
