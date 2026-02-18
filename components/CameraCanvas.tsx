'use client';

import { useEffect, useRef, useState } from 'react';
import { Point } from '@/lib/types';

interface CameraCanvasProps {
    onDrawingUpdate: (points: Point[]) => void;
    onHiddenCanvasUpdate?: (canvas: HTMLCanvasElement) => void;
}

export default function CameraCanvas({ onDrawingUpdate, onHiddenCanvasUpdate }: CameraCanvasProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastMovementTime = useRef<number>(Date.now());
    const PAUSE_THRESHOLD = 800; // 800ms pause triggers ML

    const drawingPoints = useRef<Point[]>([]);
    const [isDrawingState, setIsDrawingState] = useState(false);
    const drawingHoldCounter = useRef(0);
    const MAX_HOLD_FRAMES = 8; // Keep drawing for 8 frames even if tracking is lost
    const handsRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        const initializeMediaPipe = async () => {
            try {
                if (!videoRef.current || !canvasRef.current || !drawingCanvasRef.current) return;

                // Dynamically import MediaPipe modules (client-side only)
                const { Hands } = await import('@mediapipe/hands');
                const { Camera } = await import('@mediapipe/camera_utils');

                // Initialize MediaPipe Hands
                const hands = new Hands({
                    locateFile: (file: string) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5
                });

                hands.onResults(onResults);
                handsRef.current = hands;

                // Initialize camera
                const camera = new Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current && handsRef.current) {
                            await handsRef.current.send({ image: videoRef.current });
                        }
                    },
                    width: 640,
                    height: 480
                });

                await camera.start();
                cameraRef.current = camera;
                setIsLoading(false);

            } catch (err: any) {
                console.error('Error initializing MediaPipe:', err);
                let message = 'Failed to initialize camera. Please ensure camera permissions are granted.';

                if (err.name === 'NotReadableError' || err.message?.includes('Device in use')) {
                    message = 'Camera is already in use by another application or browser tab. Please close other camera apps (Zoom, Teams, etc.) or tabs and refresh.';
                } else if (err.name === 'NotAllowedError') {
                    message = 'Camera access was denied. Please allow camera permissions in your browser settings and refresh.';
                }

                setError(message);
                setIsLoading(false);
            }
        };

        // Initialize hidden inference canvas
        if (!hiddenCanvasRef.current) {
            const hc = document.createElement('canvas');
            hc.width = 300; hc.height = 300;
            const ctx = hc.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, 300, 300);
            }
            hiddenCanvasRef.current = hc;
        }

        initializeMediaPipe();

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
        };
    }, []);

    const isIndexFingerUp = (landmarks: any) => {
        // Landmark indices: 5 (MCP), 6 (PIP), 7 (DIP), 8 (TIP)
        const indexUp = landmarks[8].y < landmarks[7].y && landmarks[8].y < landmarks[5].y;

        // Leniency: Middle finger is down relative to its own PIP, or Index is much higher
        const middleDown = landmarks[12].y > landmarks[10].y;

        // Relative distance check (distance from wrist)
        const wrist = landmarks[0];
        const d = (l: any) => Math.sqrt(Math.pow(l.x - wrist.x, 2) + Math.pow(l.y - wrist.y, 2));

        return indexUp && (middleDown || d(landmarks[8]) > d(landmarks[12]) * 1.15);
    };

    const onResults = (results: any) => {
        if (!canvasRef.current || !drawingCanvasRef.current) return;

        const canvasCtx = canvasRef.current.getContext('2d');
        const drawingCtx = drawingCanvasRef.current.getContext('2d');

        if (!canvasCtx || !drawingCtx) return;

        // Draw video feed unmirrored (Natural View)
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Explicitly unmirror by NOT using scale(-1, 1). 
        // If results.image is mirrored by default, we flip it back.
        // Most webcams/MediaPipe defaults can be flipped here:
        canvasCtx.translate(canvasRef.current.width, 0);
        canvasCtx.scale(-1, 1);
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.restore();

        drawingCtx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
        // The background is provided by canvasRef which draws results.image

        // Redraw the drawing path with soft curves (Quadratic Bezier)
        if (drawingPoints.current.length > 2) {
            drawingCtx.strokeStyle = '#3b82f6'; // Professional blue
            drawingCtx.lineWidth = 10;
            drawingCtx.lineCap = 'round';
            drawingCtx.lineJoin = 'round';
            drawingCtx.shadowColor = '#60a5fa';
            drawingCtx.shadowBlur = 15;

            drawingCtx.beginPath();
            drawingCtx.moveTo(drawingPoints.current[0].x, drawingPoints.current[0].y);

            // Use middle points as control points for quadratic curves
            for (let i = 1; i < drawingPoints.current.length - 2; i++) {
                const xc = (drawingPoints.current[i].x + drawingPoints.current[i + 1].x) / 2;
                const yc = (drawingPoints.current[i].y + drawingPoints.current[i + 1].y) / 2;
                drawingCtx.quadraticCurveTo(drawingPoints.current[i].x, drawingPoints.current[i].y, xc, yc);
            }

            // For the last 2 points
            const last = drawingPoints.current.length - 1;
            drawingCtx.quadraticCurveTo(
                drawingPoints.current[last - 1].x,
                drawingPoints.current[last - 1].y,
                drawingPoints.current[last].x,
                drawingPoints.current[last].y
            );

            drawingCtx.stroke();
            drawingCtx.shadowBlur = 0;

            // Mirror to HIDDEN CANVAS (White on Black for ML)
            if (hiddenCanvasRef.current) {
                const hcCtx = hiddenCanvasRef.current.getContext('2d');
                if (hcCtx) {
                    hcCtx.fillStyle = 'black';
                    hcCtx.fillRect(0, 0, 300, 300);
                    hcCtx.strokeStyle = 'white';
                    hcCtx.lineWidth = 15;
                    hcCtx.lineCap = 'round';
                    hcCtx.lineJoin = 'round';
                    hcCtx.beginPath();

                    // Scale factor: internal drawing reflects 640x480, so we scale to 300x300
                    const sx = 300 / drawingCanvasRef.current.width;
                    const sy = 300 / drawingCanvasRef.current.height;

                    hcCtx.moveTo(drawingPoints.current[0].x * sx, drawingPoints.current[0].y * sy);
                    for (let i = 1; i < drawingPoints.current.length - 2; i++) {
                        const xc = ((drawingPoints.current[i].x + drawingPoints.current[i + 1].x) / 2) * sx;
                        const yc = ((drawingPoints.current[i].y + drawingPoints.current[i + 1].y) / 2) * sy;
                        hcCtx.quadraticCurveTo(drawingPoints.current[i].x * sx, drawingPoints.current[i].y * sy, xc, yc);
                    }
                    hcCtx.stroke();
                }
            }
        } else if (drawingPoints.current.length > 0) {
            // Fallback for very few points
            drawingCtx.fillStyle = '#3b82f6';
            drawingCtx.beginPath();
            drawingCtx.arc(drawingPoints.current[0].x, drawingPoints.current[0].y, 3, 0, 2 * Math.PI);
            drawingCtx.fill();
        }

        // Process Hand Landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const indexFingerTip = landmarks[8];

            // If we are unmirroring the display (scale(-1, 1)), we must also unmirror the coordinates
            const rawX = (1 - indexFingerTip.x) * drawingCanvasRef.current.width;
            const rawY = indexFingerTip.y * drawingCanvasRef.current.height;

            // Point Smoothing (Exponential Smoothing / Low-pass filter)
            let x = rawX;
            let y = rawY;
            if (drawingPoints.current.length > 0) {
                const lastPoint = drawingPoints.current[drawingPoints.current.length - 1];
                const smoothing = 0.45; // Balance between smoothness and lag
                x = lastPoint.x * smoothing + rawX * (1 - smoothing);
                y = lastPoint.y * smoothing + rawY * (1 - smoothing);

                // Movement check for pause detection
                const dist = Math.sqrt(Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2));
                if (dist > 5) {
                    lastMovementTime.current = Date.now();
                }
            }

            // Check if we should be drawing based on gesture
            const isGestureActive = isIndexFingerUp(landmarks);

            // Smoothing/Debounce logic: Prevent broken lines
            if (isGestureActive) {
                drawingHoldCounter.current = MAX_HOLD_FRAMES; // Reset hold
                if (!isDrawingState) setIsDrawingState(true);
            } else {
                if (drawingHoldCounter.current > 0) {
                    drawingHoldCounter.current--;
                } else {
                    if (isDrawingState) setIsDrawingState(false);
                }
            }

            const shouldDraw = isGestureActive || drawingHoldCounter.current > 0;

            // Visual feedback for tracking
            canvasCtx.fillStyle = shouldDraw ? '#00ff00' : '#ffff00';
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 10, 0, 2 * Math.PI);
            canvasCtx.fill();

            // Only add points if we are in drawing mode (w/ buffer)
            if (shouldDraw) {
                const point: Point = { x, y, timestamp: Date.now() };
                drawingPoints.current.push(point);
                onDrawingUpdate([...drawingPoints.current]);
                if (onHiddenCanvasUpdate && hiddenCanvasRef.current) {
                    onHiddenCanvasUpdate(hiddenCanvasRef.current);
                }

                // Glowing dot on drawing canvas
                drawingCtx.fillStyle = '#3b82f6';
                drawingCtx.shadowColor = '#ff3333';
                drawingCtx.shadowBlur = 25;
                drawingCtx.beginPath();
                drawingCtx.arc(x, y, 9, 0, 2 * Math.PI);
                drawingCtx.fill();
                drawingCtx.shadowBlur = 0;
            } else {
                // Ghost cursor when not drawing
                drawingCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                drawingCtx.beginPath();
                drawingCtx.arc(x, y, 7, 0, 2 * Math.PI);
                drawingCtx.fill();
            }
        } else {
            // If hand is totally gone, count down faster
            if (drawingHoldCounter.current > 0) {
                drawingHoldCounter.current--;
            } else if (isDrawingState) {
                setIsDrawingState(false);
            }
        }

        canvasCtx.restore();
    };

    const clearDrawing = () => {
        drawingPoints.current = [];
        onDrawingUpdate([]);
        if (hiddenCanvasRef.current) {
            const ctx = hiddenCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, 300, 300);
            }
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden group/canvas bg-black">
            <video ref={videoRef} className="hidden" playsInline />

            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain pointer-events-none"
            />

            <canvas
                ref={drawingCanvasRef}
                width={640}
                height={480}
                className={`relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full object-contain transition-all duration-700 ${isDrawingState ? 'shadow-[inset_0_0_100px_rgba(59,130,246,0.1)]' : ''}`}
            />

            {/* Scannable Area HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Corners */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-blue-500/40 rounded-tl-xl transition-all duration-500 group-hover/canvas:border-blue-400"></div>
                <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-blue-500/40 rounded-tr-xl transition-all duration-500 group-hover/canvas:border-blue-400"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-blue-500/40 rounded-bl-xl transition-all duration-500 group-hover/canvas:border-blue-400"></div>
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-blue-500/40 rounded-br-xl transition-all duration-500 group-hover/canvas:border-blue-400"></div>

                {/* Grid Scan Effect */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                {/* Scanning Bar */}
                {isDrawingState && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[scan_3s_linear_infinite] opacity-50"></div>
                )}
            </div>

            {isDrawingState && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-xl flex items-center space-x-3 border-blue-500/30 animate-float">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                    <span className="text-[10px] font-orbitron font-black text-blue-400 uppercase tracking-widest">
                        Neural Stream Active
                    </span>
                </div>
            )}

            <div className="absolute bottom-8 right-8 flex items-center space-x-4">
                <button
                    onClick={clearDrawing}
                    className="glass px-8 py-3 rounded-2xl font-orbitron font-black text-[10px] text-white uppercase tracking-[0.2em] border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-500 group/btn overflow-hidden relative"
                >
                    <span className="relative z-10">Purge Memory</span>
                    <div className="absolute inset-0 bg-red-500/0 group-hover/btn:bg-red-500/5 transition-all"></div>
                </button>
            </div>

            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/95 backdrop-blur-3xl">
                    <div className="text-center">
                        <div className="relative w-24 h-24 mb-6 mx-auto">
                            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                            <div className="absolute inset-4 rounded-full border-2 border-purple-500/20"></div>
                            <div className="absolute inset-4 rounded-full border-b-2 border-purple-500 animate-spin-reverse"></div>
                        </div>
                        <h3 className="text-xl font-orbitron font-black text-white tracking-tighter mb-2">INITIALIZING STUDIO</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">Syncing Neural Nodes...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/90 backdrop-blur-2xl p-8">
                    <div className="text-center max-w-sm">
                        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h3 className="text-xl font-orbitron font-black text-white mb-2 uppercase">L-Sync Failure</h3>
                        <p className="text-sm font-medium text-red-200/60 mb-8 leading-relaxed">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full glass py-4 rounded-2xl font-orbitron font-black text-xs text-white uppercase tracking-widest border-white/10 hover:bg-white hover:text-black transition-all"
                        >
                            Hard Reboot System
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(480px); }
                }
                .animate-spin-reverse {
                    animation: spin 3s linear infinite reverse;
                }
            `}</style>
        </div >
    );
}
