'use client';

import { useState, useEffect, useRef } from 'react';
import CameraCanvas from '@/components/CameraCanvas';
import PredictionPanel from '@/components/PredictionPanel';
import { Point, RecognitionResult } from '@/lib/types';
import { AlphabetRecognizer } from '@/lib/recognizer';

export default function AirWritingPage() {
    const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
    const [prediction, setPrediction] = useState<RecognitionResult>({ letter: '?', confidence: 0 });
    const [allPredictions, setAllPredictions] = useState<RecognitionResult[]>([]);
    const recognizerRef = useRef<AlphabetRecognizer>(new AlphabetRecognizer());

    // Live prediction loop - runs every 300ms
    useEffect(() => {
        const recognitionInterval = setInterval(() => {
            if (drawingPoints.length > 0) {
                const results = recognizerRef.current.getAllResults(drawingPoints);
                if (results.length > 0) {
                    setPrediction(results[0]);
                    setAllPredictions(results);
                } else {
                    setPrediction({ letter: '?', confidence: 0 });
                    setAllPredictions([]);
                }
            } else {
                setPrediction({ letter: '?', confidence: 0 });
                setAllPredictions([]);
            }
        }, 300);

        return () => clearInterval(recognitionInterval);
    }, [drawingPoints]);

    const handleDrawingUpdate = (points: Point[]) => {
        setDrawingPoints(points);
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="border-b border-gray-800/50 bg-gray-900/10 backdrop-blur-2xl">
                <div className="container mx-auto px-8 py-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 tracking-tighter">
                            AERO GRAPH V.1
                        </h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-2">Neural Air-Writing Intelligence</p>
                    </div>
                    <div className="flex items-center bg-gray-900/80 px-4 py-2 rounded-full border border-gray-800">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-3 shadow-[0_0_8px_#22c55e]"></span>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">System Synchronized</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-8 py-10">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left: Camera + Drawing Canvas */}
                    <div className="space-y-6">
                        <div className="bg-gray-900/20 rounded-[2.5rem] p-10 border border-gray-800/50 backdrop-blur-md shadow-2xl">
                            <h2 className="text-xl font-bold text-gray-300 mb-8 flex items-center">
                                <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mr-4">01</span>
                                Gesture Capture Window
                            </h2>
                            <CameraCanvas onDrawingUpdate={handleDrawingUpdate} />
                        </div>
                    </div>

                    {/* Right: Live Prediction Panel */}
                    <div className="space-y-6">
                        <div className="flex items-center mb-4">
                            <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mr-4">02</span>
                            <h2 className="text-xl font-bold text-gray-300">Neural Interpretation</h2>
                        </div>
                        <PredictionPanel result={prediction} allPredictions={allPredictions} />
                    </div>
                </div>

                {/* Supported Letters */}
                <div className="mt-12 bg-gray-900/40 rounded-[2rem] p-8 border border-gray-800/50 backdrop-blur-md">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] mb-6 text-center">Supported Neural Patterns</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-11 gap-4">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => (
                            <div
                                key={letter}
                                className="bg-black/60 rounded-lg p-2 text-center border border-gray-800 hover:border-blue-500 transition-all group hover:scale-110"
                            >
                                <span className="text-sm font-black text-gray-400 group-hover:text-white">{letter}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                    More letters can be added by extending the recognition rules
                </p>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 mt-12 bg-black bg-opacity-50">
                <div className="container mx-auto px-6 py-4 text-center text-gray-500 text-sm">
                    <p>Live Air-Writing Alphabet Recognition System • Built with Next.js & MediaPipe</p>
                </div>
            </footer>
        </div>
    );
}
