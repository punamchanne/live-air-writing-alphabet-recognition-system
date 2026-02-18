'use client';

import { RecognitionResult } from '@/lib/types';

interface PredictionPanelProps {
    result: RecognitionResult;
    alternatives?: RecognitionResult[];
}

export default function PredictionPanel({ result, alternatives = [] }: PredictionPanelProps) {
    const topPossibilities = alternatives
        .filter(p => p.confidence > 0.05) // Show reasonably confident alternatives
        .slice(0, 3);

    return (
        <div className="w-full">
            <div className="glass rounded-[2rem] p-6 lg:p-10 border-white/5 relative overflow-hidden group">
                {/* Background holographic glow */}
                <div className="absolute -bottom-20 -right-20 w-48 sm:w-64 h-48 sm:h-64 bg-purple-500/5 rounded-full blur-[80px] group-hover:bg-purple-500/10 transition-all duration-1000"></div>

                {/* Mode Badge */}
                {result.mode === 'final' ? (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-purple-500/20 text-purple-400 text-[10px] font-orbitron font-black px-4 py-1.5 rounded-full border border-purple-500/30 z-10 shadow-[0_0_20px_rgba(168,85,247,0.3)] animate-float">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                        <span className="tracking-[0.2em] uppercase">Neural Final</span>
                    </div>
                ) : (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-blue-500/10 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-500/20 z-10 uppercase tracking-[0.2em]">
                        <span>Real-time Stream</span>
                    </div>
                )}

                <div className="text-center pt-8">
                    {/* Character Display */}
                    <div className="relative inline-block mb-4">
                        <div className={`text-[5rem] sm:text-[8rem] lg:text-[10rem] font-orbitron font-black leading-none transition-all duration-700 ${result.mode === 'final' ? 'text-white text-glow-purple scale-110 translate-y-2' : 'text-blue-400 text-glow-blue opacity-80'}`}>
                            {result.letter}
                        </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="mt-8 space-y-3">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[10px] font-orbitron font-black text-gray-500 uppercase tracking-[0.3em]">
                                Link Confidence
                            </span>
                            <span className={`text-sm font-orbitron font-black ${result.mode === 'final' ? 'text-purple-400' : 'text-blue-400'}`}>
                                {Math.round(result.confidence * 100)}<span className="text-[10px] ml-0.5 opacity-50">%</span>
                            </span>
                        </div>
                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 ring-1 ring-white/10">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${result.mode === 'final' ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}
                                style={{ width: `${result.confidence * 100}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Candidates Section */}
            {topPossibilities.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-white/10"></div>
                        <h4 className="text-[10px] font-orbitron font-black text-gray-500 uppercase tracking-[0.4em]">Alternative Data Nodes</h4>
                        <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-white/10"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {topPossibilities.map((p, i) => (
                            <div key={p.letter} className="glass flex items-center justify-between p-4 rounded-2xl border-white/5 group hover:bg-white/5 transition-all">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl mr-4 font-orbitron font-black border transition-all ${i === 0 ? 'bg-blue-500/20 text-white border-blue-500/30' : 'bg-white/5 text-gray-400 border-white/5'}`}>
                                        {p.letter}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Index {i + 1}</span>
                                        <span className="text-xs font-bold text-gray-300">Neural Match</span>
                                    </div>
                                </div>
                                <span className="text-xs font-orbitron font-bold text-blue-500/60">{Math.round(p.confidence * 100)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Status Strip */}
            <div className="mt-8 flex items-center justify-center space-x-6 glass py-4 rounded-2xl border-white/5">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${result.confidence > 0 ? (result.mode === 'final' ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]') : 'bg-gray-800 animate-pulse-slow'}`}></div>
                    <span className="text-[9px] font-orbitron font-black text-gray-500 tracking-[0.1em] uppercase">
                        {result.mode === 'final' ? 'Compute Locked' : 'IO Stream Open'}
                    </span>
                </div>
                <div className="w-[1px] h-4 bg-white/10"></div>
                <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-orbitron font-black text-gray-500 tracking-[0.1em] uppercase">V2.4 Link</span>
                    <span className="text-blue-500 text-[10px]">●</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
