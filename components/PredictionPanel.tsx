'use client';

import { RecognitionResult } from '@/lib/types';

interface PredictionPanelProps {
    result: RecognitionResult;
    allPredictions?: RecognitionResult[];
}

export default function PredictionPanel({ result, allPredictions = [] }: PredictionPanelProps) {
    // Top 3 possibilities with confidence > 0
    const topPossibilities = allPredictions
        .filter(p => p.confidence > 0)
        .slice(0, 3);

    return (
        <div className="w-full max-w-md">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-gray-700 shadow-2xl backdrop-blur-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-2">Live Analysis</h2>
                    <h3 className="text-3xl font-bold text-white mb-2">Recognition Result</h3>
                    <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full"></div>
                </div>

                {/* Primary Prediction Display */}
                <div className={`bg-gray-900/50 rounded-2xl p-10 mb-8 border transition-all duration-500 relative group ${result.mode === 'final' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] bg-purple-900/10' : 'border-gray-800'}`}>
                    {result.mode === 'final' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg z-10 animate-bounce">
                            FINAL ML PREDICTION
                        </div>
                    )}
                    <div className="text-center">
                        <div className={`text-9xl font-black mb-4 transition-all duration-500 ${result.mode === 'final' ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110' : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}>
                            {result.letter}
                        </div>

                        {/* Accuracy Section */}
                        <div className="mt-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    {result.mode === 'final' ? 'Neural Confidence' : 'Rule Probability'}
                                </span>
                                <span className={`text-sm font-black transition-all ${result.confidence >= 0.8 ? 'text-green-400 drop-shadow-[0_0_8px_#4ade80]' : 'text-yellow-400'}`}>
                                    {Math.round(result.confidence * 100)}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-800">
                                <div
                                    className={`h-full transition-all duration-500 ease-out shadow-[0_0_10px_currentColor] ${result.mode === 'final' ? 'bg-purple-500' : (result.confidence >= 0.8 ? 'bg-green-500' : 'bg-blue-500')}`}
                                    style={{ width: `${result.confidence * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Possibilities Section */}
                {topPossibilities.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Top Candidates</h4>
                        <div className="space-y-3">
                            {topPossibilities.map((p, i) => (
                                <div key={p.letter} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-gray-800/50">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg mr-4 font-black ${i === 0 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                            {p.letter}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-300">Match Rank {i + 1}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-500">{Math.round(p.confidence * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status Indicator */}
                <div className="flex items-center justify-center space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${result.confidence > 0 ? (result.mode === 'final' ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]') : 'bg-gray-700'}`}></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {result.mode === 'final' ? 'Neural Processing Complete' : (result.confidence > 0 ? 'Gesture Stream Active' : 'Waiting for Input')}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-gray-900/60 rounded-2xl p-4 sm:p-6 border border-gray-800/80 backdrop-blur-md">
                <h3 className="text-white text-sm font-bold mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Mobile Guide
                </h3>
                <ul className="text-gray-400 text-[11px] sm:text-sm space-y-2">
                    <li className="flex items-start">
                        <span className="text-blue-500/50 mr-2">01</span>
                        <span>Ensure your index finger is clearly visible</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-blue-500/50 mr-2">02</span>
                        <span>Draw steadily in the capture window</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-blue-500/50 mr-2">03</span>
                        <span>Pause for a second to get accurate ML result</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
