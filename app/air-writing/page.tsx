'use client';

import { useState, useEffect, useRef } from 'react';
import CameraCanvas from '@/components/CameraCanvas';
import PredictionPanel from '@/components/PredictionPanel';
import { Point, RecognitionResult } from '@/lib/types';
import { AlphabetRecognizer } from '@/lib/recognizer';

export default function AirWritingPage() {
    const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
    const [prediction, setPrediction] = useState<RecognitionResult>({ letter: '?', confidence: 0, mode: 'live' });
    const [allPredictions, setAllPredictions] = useState<RecognitionResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const recognizerRef = useRef<AlphabetRecognizer>(new AlphabetRecognizer());
    const lastPointCount = useRef(0);
    const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Live prediction loop - runs every 300ms
    useEffect(() => {
        const recognitionInterval = setInterval(() => {
            if (drawingPoints.length > 0 && !isProcessing && prediction.mode !== 'final') {
                const results = recognizerRef.current.getAllResults(drawingPoints);
                if (results.length > 0) {
                    setPrediction({ ...results[0], mode: 'live' });
                    setAllPredictions(results);
                }
            }
        }, 300);

        return () => clearInterval(recognitionInterval);
    }, [drawingPoints, isProcessing, prediction.mode]);

    // Final Prediction Logic - Triggered when points stop increasing for ~800ms
    useEffect(() => {
        if (drawingPoints.length > 0 && drawingPoints.length === lastPointCount.current && !isProcessing && prediction.mode !== 'final') {
            // Points haven't changed, start/continue pause timer
            if (!pauseTimerRef.current) {
                pauseTimerRef.current = setTimeout(async () => {
                    const canvas = document.querySelector('canvas:nth-of-type(2)') as HTMLCanvasElement;
                    if (canvas && drawingPoints.length > 5) {
                        setIsProcessing(true);
                        try {
                            const { preprocessCanvas } = await import('@/lib/preprocess');
                            const { predictAlphabet } = await import('@/lib/model');

                            const tensor = await preprocessCanvas(canvas, drawingPoints);
                            const result = await predictAlphabet(tensor);

                            setPrediction({ ...result, mode: 'final' });

                            // Auto-clear after 2 seconds
                            setTimeout(() => {
                                handleClear();
                            }, 2000);
                        } catch (err) {
                            console.error('Final prediction failed:', err);
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }, 800);
            }
        } else {
            // Points changed or already final, clear pause timer
            if (pauseTimerRef.current) {
                clearTimeout(pauseTimerRef.current);
                pauseTimerRef.current = null;
            }
        }
        lastPointCount.current = drawingPoints.length;
    }, [drawingPoints, isProcessing, prediction.mode]);

    const handleClear = () => {
        setDrawingPoints([]);
        setPrediction({ letter: '?', confidence: 0, mode: 'live' });
        setAllPredictions([]);
        const clearBtn = document.querySelector('button') as HTMLButtonElement;
        if (clearBtn && clearBtn.textContent?.includes('CLEAR')) {
            clearBtn.click(); // Trigger the refs inside CameraCanvas
        }
    };

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
            <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Left: Camera + Drawing Canvas */}
                    <div className="space-y-6">
                        <div className="bg-gray-900/20 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-10 border border-gray-800/50 backdrop-blur-md shadow-2xl">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-300 mb-6 sm:mb-8 flex items-center">
                                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3 sm:mr-4 text-xs sm:text-base">01</span>
                                Gesture Capture Window
                            </h2>
                            <CameraCanvas onDrawingUpdate={handleDrawingUpdate} />
                        </div>
                    </div>

                    {/* Right: Live Prediction Panel */}
                    <div className="space-y-6">
                        <div className="flex items-center mb-2 sm:mb-4">
                            <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mr-3 sm:mr-4 text-xs sm:text-base">02</span>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-300">Neural Interpretation</h2>
                        </div>
                        <PredictionPanel result={prediction} allPredictions={allPredictions} />
                    </div>
                </div>

                {/* Supported Letters */}
                <div className="mt-8 sm:mt-12 bg-gray-900/40 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 border border-gray-800/50 backdrop-blur-md overflow-x-auto">
                    <h3 className="text-[10px] sm:text-sm font-black text-gray-500 uppercase tracking-[0.3em] mb-4 sm:mb-6 text-center">Supported Neural Patterns</h3>
                    <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 sm:gap-4 min-w-[300px]">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => (
                            <div
                                key={letter}
                                className="bg-black/60 rounded-lg p-2 text-center border border-gray-800 hover:border-blue-500 transition-all group hover:scale-110"
                            >
                                <span className="text-xs sm:text-sm font-black text-gray-400 group-hover:text-white">{letter}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-gray-500 text-[10px] sm:text-sm mt-4 italic text-center sm:text-left">
                    More characters added via EMNIST 62-class expansion.
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
