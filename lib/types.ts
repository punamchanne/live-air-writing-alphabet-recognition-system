// TypeScript types for the air-writing system

export interface Point {
  x: number;
  y: number;
  timestamp: number;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface RecognitionResult {
  letter: string;
  confidence: number;
  mode?: 'live' | 'final';
}

export interface DrawingData {
  points: Point[];
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}
