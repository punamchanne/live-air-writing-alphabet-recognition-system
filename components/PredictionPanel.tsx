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
                <div className="bg-gray-900/50 rounded-2xl p-10 mb-8 border border-gray-800 relative group transition-all hover:bg-gray-900">
                    <div className="text-center">
                        <div className="text-9xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] mb-4">
                            {result.letter}
                        </div>

                        {/* Accuracy Section */}
                        <div className="mt-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Accuracy Score</span>
                                <span className={`text-sm font-black transition-all ${result.confidence >= 0.8 ? 'text-green-400 drop-shadow-[0_0_8px_#4ade80]' : 'text-yellow-400'}`}>
                                    {Math.round(result.confidence * 100)}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-800">
                                <div
                                    className={`h-full transition-all duration-500 ease-out shadow-[0_0_10px_currentColor] ${result.confidence >= 0.8 ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${result.confidence * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Possibilities Section */}
                {topPossibilities.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Other Possibilities</h4>
                        <div className="space-y-3">
                            {topPossibilities.map((p, i) => (
                                <div key={p.letter} className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-gray-800/50">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg mr-4 font-black ${i === 0 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                            {p.letter}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-300">Target Match: {p.letter}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-gray-500">{Math.round(p.confidence * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status Indicator */}
                <div className="flex items-center justify-center space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${result.confidence > 0 ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-gray-700'}`}></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {result.confidence > 0 ? 'Deep Scan Active' : 'Waiting for Gesture'}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-3">How to Use</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                    <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Point your index finger at the camera</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Draw letters in the air</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Prediction updates live while drawing</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>Click "Clear" to start over</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
