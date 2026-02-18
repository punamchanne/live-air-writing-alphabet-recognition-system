'use client';

import { useState, useEffect, useRef } from 'react';
import CameraCanvas from '@/components/CameraCanvas';
import PredictionPanel from '@/components/PredictionPanel';
import { Point, RecognitionResult } from '@/lib/types';

export default function AirWritingPage() {
    const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
    const [prediction, setPrediction] = useState<RecognitionResult & { alternatives?: RecognitionResult[] }>({ letter: '?', confidence: 0, mode: 'live' });
    const [alternatives, setAlternatives] = useState<RecognitionResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Tuning parameters
    const [strokeWeight, setStrokeWeight] = useState(12);
    const [predictionDelay, setPredictionDelay] = useState(800);
    const [diagImage, setDiagImage] = useState<string | null>(null);
    const [hiddenCanvas, setHiddenCanvas] = useState<HTMLCanvasElement | null>(null);
    const [showDebugVision, setShowDebugVision] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const lastPointCount = useRef(0);
    const lastProcessedCount = useRef(0);
    const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Live prediction loop - shifted to PURE NEURAL
    useEffect(() => {
        const recognitionInterval = setInterval(async () => {
            // Only run if points have changed and we aren't already final or busy
            if (drawingPoints.length > 5 &&
                drawingPoints.length !== lastProcessedCount.current &&
                !isProcessing &&
                prediction.mode !== 'final') {

                const canvas = document.querySelector('canvas:nth-of-type(2)') as HTMLCanvasElement;
                if (!canvas) return;

                try {
                    const { preprocessCanvas } = await import('@/lib/preprocess');
                    const { predictAlphabet } = await import('@/lib/model');
                    const { AlphabetRecognizer } = await import('@/lib/recognizer');
                    const recognizer = new AlphabetRecognizer();

                    // USE HIDDEN CANVAS ONLY
                    const source = hiddenCanvas || canvas;
                    const tensor = await preprocessCanvas(source, drawingPoints, { strokeWidth: strokeWeight });

                    // Capture live diagnostics...
                    const data = await tensor.data();
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 112; tempCanvas.height = 112;
                    const ctx = tempCanvas.getContext('2d');
                    if (ctx) {
                        for (let i = 0; i < 28; i++) {
                            for (let j = 0; j < 28; j++) {
                                const val = data[i * 28 + j] * 255;
                                ctx.fillStyle = `rgb(${val},${val},${val})`;
                                ctx.fillRect(j * 4, i * 4, 4, 4);
                            }
                        }
                        setDiagImage(tempCanvas.toDataURL());
                    }

                    const neuralResult = await predictAlphabet(tensor);
                    const geometricResult = recognizer.recognize(drawingPoints);

                    // BLENDING LOGIC: Geometric ($1) vs Neural
                    // If geometric confidence is high (> 0.7), it's usually correct for shapes like W, S, O.
                    let finalResult = neuralResult;

                    if (geometricResult.confidence > 0.75) {
                        // High confidence in geometry overrides valid neural
                        finalResult = { ...geometricResult, mode: 'live', alternatives: neuralResult.alternatives };
                    } else if (geometricResult.confidence > 0.5 && neuralResult.confidence < 0.6) {
                        // If neural is unsure but geometry has a decent guess
                        finalResult = { ...geometricResult, mode: 'live', alternatives: neuralResult.alternatives };
                    }

                    setPrediction(finalResult);
                    setAlternatives(neuralResult.alternatives || []);
                    lastProcessedCount.current = drawingPoints.length;

                    // Cleanup live tensor to prevent memory pressure
                    tensor.dispose();
                } catch (err) {
                    console.error('Live neural prediction failed:', err);
                }
            }
        }, 400); // Throttled to 400ms for stable neural processing

        return () => clearInterval(recognitionInterval);
    }, [drawingPoints, isProcessing, prediction.mode, strokeWeight, hiddenCanvas]);

    // Final Prediction Logic
    useEffect(() => {
        if (drawingPoints.length > 0 && drawingPoints.length === lastPointCount.current && !isProcessing && prediction.mode !== 'final') {
            if (!pauseTimerRef.current) {
                pauseTimerRef.current = setTimeout(async () => {
                    const canvas = document.querySelector('canvas:nth-of-type(2)') as HTMLCanvasElement;
                    if (canvas && drawingPoints.length > 5) {
                        setIsProcessing(true);
                        try {
                            const { preprocessCanvas } = await import('@/lib/preprocess');
                            const { predictAlphabet } = await import('@/lib/model');
                            const { AlphabetRecognizer } = await import('@/lib/recognizer');
                            const recognizer = new AlphabetRecognizer();

                            const source = hiddenCanvas || canvas;
                            const tensor = await preprocessCanvas(source, drawingPoints, { strokeWidth: strokeWeight });
                            const neuralResult = await predictAlphabet(tensor);
                            const data = await tensor.data();
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = 112; tempCanvas.height = 112;
                            const ctx = tempCanvas.getContext('2d');
                            if (ctx) {
                                for (let i = 0; i < 28; i++) {
                                    for (let j = 0; j < 28; j++) {
                                        const val = data[i * 28 + j] * 255;
                                        ctx.fillStyle = `rgb(${val},${val},${val})`;
                                        ctx.fillRect(j * 4, i * 4, 4, 4);
                                    }
                                }
                                setDiagImage(tempCanvas.toDataURL());
                            }
                            const geometricResult = recognizer.recognize(drawingPoints);

                            let finalResult = neuralResult;

                            // Stronger reliance on geometry for final result
                            if (geometricResult.confidence > 0.7) {
                                finalResult = { ...geometricResult, mode: 'final' };
                            } else if (geometricResult.confidence > 0.5 && neuralResult.confidence < 0.6) {
                                finalResult = { ...geometricResult, mode: 'final' };
                            } else {
                                finalResult = { ...neuralResult, mode: 'final' };
                            }

                            setPrediction(finalResult);
                            setAlternatives(neuralResult.alternatives || []);

                            setTimeout(() => {
                                handleClear();
                                setDiagImage(null);
                            }, 2000);
                        } catch (err) {
                            console.error('Final prediction failed:', err);
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }, predictionDelay);
            }
        } else {
            if (pauseTimerRef.current) {
                clearTimeout(pauseTimerRef.current);
                pauseTimerRef.current = null;
            }
        }
        lastPointCount.current = drawingPoints.length;
    }, [drawingPoints, isProcessing, prediction.mode, predictionDelay, strokeWeight]);

    const handleClear = () => {
        setDrawingPoints([]);
        setPrediction({ letter: '?', confidence: 0, mode: 'live' });
        setAlternatives([]);
        lastProcessedCount.current = 0;
        const clearBtn = document.querySelector('button') as HTMLButtonElement;
        if (clearBtn && clearBtn.textContent?.includes('CLEAR')) {
            clearBtn.click();
        }
    };

    const handleDrawingUpdate = (points: Point[]) => {
        setDrawingPoints(points);
    };

    return (
        <div className="h-[100dvh] flex flex-col bg-black overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Mobile-First Header */}
            <header className="flex-none h-14 sm:h-16 glass border-b border-white/5 px-4 flex items-center justify-between z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-orbitron font-black text-sm italic">A</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-orbitron font-black tracking-tighter text-glow-blue uppercase">
                            Aero <span className="text-blue-400">Pro</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Status Indicator */}
                    <div className="flex items-center space-x-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                        <span className="text-[10px] font-orbitron text-gray-400 tracking-wider">LIVE</span>
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </div>
            </header>

            {/* Main App Workspace - 100dvh Stack */}
            <main className="flex-1 relative overflow-hidden flex flex-col">

                {/* 1. Camera Section (Takes all available space) */}
                <div className="flex-1 relative bg-black/50 z-10 flex items-center justify-center">
                    <div className="w-full h-full relative">
                        <CameraCanvas
                            onDrawingUpdate={handleDrawingUpdate}
                            onHiddenCanvasUpdate={setHiddenCanvas}
                        />

                        {/* Hidden Canvas Overlay (Vision Mode) */}
                        {showDebugVision && hiddenCanvas && (
                            <div className="absolute top-4 right-4 z-[60] border border-cyan-500 rounded-lg overflow-hidden shadow-lg bg-black/90 w-32 h-32">
                                <img src={hiddenCanvas.toDataURL()} className="w-full h-full opacity-80" />
                                <div className="absolute bottom-0 w-full bg-cyan-500/20 text-[6px] text-cyan-400 text-center font-bold uppercase py-0.5">Neural Vision</div>
                            </div>
                        )}

                        {/* Mobile Instruction Overlay */}
                        {drawingPoints.length === 0 && (
                            <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none opacity-50">
                                <p className="text-xs font-orbitron text-white uppercase tracking-[0.2em] animate-pulse">Draw in Air</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Prediction Panel (Bottom Sheet) */}
                <div className="flex-none bg-[#020617] border-t border-white/10 relative z-20 pb-safe">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full mb-2"></div>
                    <PredictionPanel result={prediction} alternatives={alternatives} />
                </div>
            </main>

            {/* Settings Drawer (Overlay) */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsSettingsOpen(false)}>
                    <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-[#0b1121] border-l border-white/10 p-6 shadow-2xl animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-lg font-orbitron font-black text-white uppercase">Settings</h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Neural Calibration Controls moved here */}
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                    <span>Stroke Weight</span>
                                    <span className="text-cyan-400">{strokeWeight}px</span>
                                </div>
                                <input
                                    type="range" min="4" max="24" step="2"
                                    value={strokeWeight}
                                    onChange={(e) => setStrokeWeight(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                    <span>Delay</span>
                                    <span className="text-cyan-400">{predictionDelay}ms</span>
                                </div>
                                <input
                                    type="range" min="400" max="2000" step="200"
                                    value={predictionDelay}
                                    onChange={(e) => setPredictionDelay(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-500"
                                />
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <button
                                    onClick={() => setShowDebugVision(!showDebugVision)}
                                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${showDebugVision ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400'}`}
                                >
                                    {showDebugVision ? 'Vision Mode: ON' : 'Vision Mode: OFF'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop-Only Footer (Hidden on Mobile) */}
            <div className="hidden md:block mt-12 lg:mt-24 px-4">
                {/* Only show on large screens if strictly needed, or just remove entirely for mobile-first focus */}
            </div>
        </div >
    );
}
