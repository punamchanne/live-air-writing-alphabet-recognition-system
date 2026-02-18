import { Point } from './types';

// Helper to create a point easily
const P = (x: number, y: number) => ({ x, y, timestamp: 0 });

export interface UnistrokeTemplate {
    name: string;
    points: Point[];
}

// Templates based on standard unistroke gestures
// These are idealized paths. The recognizer will normalize input to match these.
export const TEMPLATES: UnistrokeTemplate[] = [
    // --- NUMBERS (DISABLED) ---
    // { name: '1', points: [P(10, 0), P(10, 100)] },
    // { name: '2', points: [P(0, 0), P(50, 0), P(50, 50), P(0, 100), P(50, 100)] },
    // { name: '3', points: [P(0, 0), P(50, 0), P(50, 50), P(20, 50), P(50, 50), P(50, 100), P(0, 100)] },
    // { name: '4', points: [P(40, 0), P(0, 50), P(50, 50), P(40, 0), P(40, 100)] },
    // { name: '5', points: [P(50, 0), P(0, 0), P(0, 50), P(50, 50), P(50, 100), P(0, 100)] },
    // { name: '6', points: [P(50, 0), P(0, 100), P(50, 100), P(50, 50), P(0, 50)] },
    // { name: '7', points: [P(0, 0), P(50, 0), P(0, 100)] },
    // { name: '8', points: [P(50, 50), P(0, 0), P(50, 0), P(50, 100), P(0, 100), P(0, 50), P(50, 50)] },
    // { name: '9', points: [P(50, 50), P(0, 50), P(0, 0), P(50, 0), P(50, 100)] },
    // { name: '0', points: [P(25, 0), P(50, 50), P(25, 100), P(0, 50), P(25, 0)] },

    // --- LETTERS ---
    { name: 'A', points: [P(0, 100), P(25, 0), P(50, 100), P(10, 75), P(40, 75)] }, // Standard
    { name: 'A', points: [P(0, 100), P(25, 0), P(50, 100), P(50, 75), P(10, 75)] }, // Continuous (Retrace right leg up, cross left)
    { name: 'A', points: [P(25, 0), P(0, 100), P(25, 0), P(50, 100), P(10, 75), P(40, 75)] }, // Roof style (Apex down left, Apex down right, cross)

    { name: 'B', points: [P(10, 100), P(10, 0), P(40, 0), P(50, 25), P(10, 50), P(50, 75), P(40, 100), P(10, 100)] },

    { name: 'C', points: [P(50, 20), P(20, 0), P(0, 50), P(20, 100), P(50, 80)] },

    { name: 'D', points: [P(10, 100), P(10, 0), P(40, 0), P(50, 50), P(40, 100), P(10, 100)] },

    { name: 'E', points: [P(50, 0), P(0, 0), P(0, 50), P(40, 50), P(0, 50), P(0, 100), P(50, 100)] }, // Standard
    { name: 'E', points: [P(50, 0), P(0, 0), P(0, 50), P(30, 50), P(0, 50), P(0, 100), P(50, 100)] }, // Zigzag style

    { name: 'F', points: [P(50, 0), P(0, 0), P(0, 50), P(40, 50), P(0, 50), P(0, 100)] }, // Standard
    { name: 'F', points: [P(50, 0), P(0, 0), P(0, 100), P(0, 50), P(40, 50)] }, // Continuous (Top-Left-Down-Up-Right)

    { name: 'G', points: [P(50, 20), P(20, 0), P(0, 50), P(20, 100), P(50, 100), P(50, 60), P(30, 60)] },

    { name: 'H', points: [P(10, 0), P(10, 100), P(10, 50), P(40, 50), P(40, 0), P(40, 100)] }, // Standard
    { name: 'H', points: [P(10, 0), P(10, 100), P(10, 50), P(40, 50), P(40, 100)] }, // Lowercase h style (common in fast writing)
    { name: 'H', points: [P(0, 0), P(0, 100), P(50, 0), P(50, 100), P(0, 50), P(50, 50)] }, // LeftDown-RightDown-Cross (Stroke order variation, though geometric handles single path)
    // Actually, LeftDown -> Jump -> RightDown -> Jump -> Cross is: | \ | / -
    // A better continuous H is Down(Left) -> Up(Left) -> Right(Top) -> Down(Right) -> Up(Right) -> Left(Mid) -> Right(Mid) ... too complex.
    // The "h" style is the most likely continuous match.

    { name: 'I', points: [P(25, 0), P(25, 100)] },

    { name: 'J', points: [P(40, 0), P(40, 80), P(20, 100), P(0, 80)] },

    { name: 'K', points: [P(0, 0), P(0, 100), P(0, 50), P(50, 0), P(0, 50), P(50, 100)] }, // Standard
    { name: 'K', points: [P(50, 0), P(0, 50), P(0, 100), P(0, 0), P(0, 50), P(50, 100)] }, // Continuous (TopRight-Middle-DownLeft-UpLeft-Middle-DownRight)

    { name: 'L', points: [P(10, 0), P(10, 100), P(50, 100)] },

    { name: 'M', points: [P(0, 100), P(0, 0), P(25, 50), P(50, 0), P(50, 100)] }, // Standard
    { name: 'M', points: [P(0, 100), P(0, 0), P(25, 35), P(50, 0), P(50, 100)] }, // Shallow Middle

    { name: 'N', points: [P(0, 100), P(0, 0), P(50, 100), P(50, 0)] },

    { name: 'O', points: [P(25, 0), P(50, 50), P(25, 100), P(0, 50), P(25, 0)] },

    { name: 'P', points: [P(0, 100), P(0, 0), P(50, 0), P(50, 50), P(0, 50)] },

    { name: 'Q', points: [P(25, 0), P(50, 50), P(25, 100), P(0, 50), P(25, 0), P(25, 75), P(50, 100)] },

    { name: 'R', points: [P(0, 100), P(0, 0), P(50, 0), P(50, 50), P(0, 50), P(50, 100)] },

    { name: 'S', points: [P(50, 0), P(0, 25), P(50, 75), P(0, 100)] },

    { name: 'T', points: [P(0, 0), P(50, 0), P(25, 0), P(25, 100)] }, // Standard
    { name: 'T', points: [P(0, 0), P(50, 0), P(25, 0), P(25, 100)] }, // Teapot style (Top-Left-Right-Back-Down) is implied by resampling

    { name: 'U', points: [P(0, 0), P(0, 100), P(50, 100), P(50, 0)] },

    { name: 'V', points: [P(0, 0), P(25, 100), P(50, 0)] },

    { name: 'W', points: [P(0, 0), P(0, 100), P(25, 50), P(50, 100), P(50, 0)] }, // Standard
    { name: 'W', points: [P(0, 0), P(0, 100), P(25, 65), P(50, 100), P(50, 0)] }, // Shallow Middle (Common in air writing)
    { name: 'W', points: [P(0, 0), P(10, 100), P(25, 0), P(40, 100), P(50, 0)] }, // Sawtooth W (Sharp peaks)

    { name: 'X', points: [P(0, 0), P(50, 100), P(25, 50), P(50, 0), P(0, 100)] }, // Standard (Cross)
    { name: 'X', points: [P(0, 0), P(50, 100), P(50, 0), P(0, 100)] }, // Continuous (Butterfly)

    { name: 'Y', points: [P(0, 0), P(25, 50), P(50, 0), P(25, 50), P(25, 100)] }, // Standard
    { name: 'Y', points: [P(0, 0), P(50, 0), P(50, 100)] }, // U-like Y

    { name: 'Z', points: [P(0, 0), P(50, 0), P(0, 100), P(50, 100)] }
];
