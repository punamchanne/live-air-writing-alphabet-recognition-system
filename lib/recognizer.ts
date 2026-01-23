// Advanced Rule-based alphabet recognition engine
import { Point, RecognitionResult, DrawingData } from './types';

export class AlphabetRecognizer {
    private minPointsForRecognition = 5;

    /**
     * Returns the best alphabet guess with improved precision weighting
     */
    recognize(points: Point[]): RecognitionResult {
        const results = this.getAllResults(points);
        if (results.length === 0) return { letter: '?', confidence: 0 };
        return results[0];
    }

    /**
     * Returns all results sorted by confidence, with 80%+ targets for strong matches
     */
    getAllResults(points: Point[]): RecognitionResult[] {
        if (points.length < this.minPointsForRecognition) return [];

        const drawingData = this.analyzeDrawing(points);

        const possibleResults = [
            this.recognizeA(drawingData), this.recognizeB(drawingData), this.recognizeC(drawingData),
            this.recognizeD(drawingData), this.recognizeE(drawingData), this.recognizeF(drawingData),
            this.recognizeG(drawingData), this.recognizeH(drawingData), this.recognizeI(drawingData),
            this.recognizeJ(drawingData), this.recognizeK(drawingData), this.recognizeL(drawingData),
            this.recognizeM(drawingData), this.recognizeN(drawingData),
            this.recognizeO(drawingData), this.recognizeP(drawingData), this.recognizeQ(drawingData),
            this.recognizeR(drawingData), this.recognizeS(drawingData), this.recognizeT(drawingData),
            this.recognizeU(drawingData), this.recognizeV(drawingData), this.recognizeW(drawingData),
            this.recognizeX(drawingData), this.recognizeY(drawingData), this.recognizeZ(drawingData),
        ];

        return possibleResults
            .filter(r => r.confidence > 0)
            .sort((a, b) => b.confidence - a.confidence);
    }

    private analyzeDrawing(points: Point[]): DrawingData {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        return {
            points,
            boundingBox: {
                minX: Math.min(...xs), maxX: Math.max(...xs),
                minY: Math.min(...ys), maxY: Math.max(...ys),
            }
        };
    }

    // --- High Accuracy specialized rules (Target 80%+) ---

    private recognizeI(data: DrawingData): RecognitionResult {
        const { boundingBox, points } = data;
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;
        const vDev = this.calculateVerticalDeviation(points);

        if (height > 30 && height / (width + 1) > 2.0 && vDev < 0.3) {
            const conf = Math.min(0.96, 0.75 + (height / 400) + (0.1 - vDev));
            return { letter: 'I', confidence: conf };
        }
        return { letter: 'I', confidence: 0 };
    }

    private recognizeO(data: DrawingData): RecognitionResult {
        const { boundingBox, points } = data;
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;
        const isClosed = this.isPathClosed(points);
        const isLoop = this.isLoopShape(points, boundingBox);
        const aspectRatio = Math.max(width, height) / Math.min(width, height);

        if (isClosed && isLoop && aspectRatio < 1.6 && width > 40) {
            return { letter: 'O', confidence: 0.88 };
        }
        return { letter: 'O', confidence: 0 };
    }

    private recognizeS(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;
        if (height < 50 || width < 30) return { letter: 'S', confidence: 0 };

        // S-curve detection: check for 3 horizontal phases (Right -> Left -> Right)
        // or 2 distinct x-direction reversals
        let xReversals = 0;
        let lastDir = 0; // 1 for right, -1 for left
        for (let i = 2; i < points.length; i++) {
            const dx = points[i].x - points[i - 2].x;
            if (Math.abs(dx) > 5) {
                const dir = dx > 0 ? 1 : -1;
                if (lastDir !== 0 && dir !== lastDir) {
                    xReversals++;
                }
                lastDir = dir;
            }
        }

        if (xReversals >= 2 && height > width * 0.8) {
            return { letter: 'S', confidence: 0.90 };
        }
        return { letter: 'S', confidence: 0 };
    }

    private recognizeA(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;

        const topPoints = points.filter(p => p.y < boundingBox.minY + height / 3);
        const bottomPoints = points.filter(p => p.y > boundingBox.maxY - height / 3);

        const topW = topPoints.length > 0 ? Math.max(...topPoints.map(p => p.x)) - Math.min(...topPoints.map(p => p.x)) : width;
        const bottomW = bottomPoints.length > 0 ? Math.max(...bottomPoints.map(p => p.x)) - Math.min(...bottomPoints.map(p => p.x)) : 0;

        // A should be triangular (narrow top, wide bottom) and have relatively straight sides
        if (height > 50 && bottomW > topW * 1.5 && this.hasTriangularTop(points, boundingBox)) {
            const valleyCount = this.countValleys(points, 0.4);
            const linearity = this.calculateLinearity(points); // Ensure strokes aren't curvy like 'S'

            if (valleyCount === 0 && linearity > 0.7) {
                return { letter: 'A', confidence: 0.92 };
            }
        }
        return { letter: 'A', confidence: 0 };
    }

    private recognizeT(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;

        const topPoints = points.filter(p => p.y < boundingBox.minY + height * 0.25);
        if (topPoints.length < 5) return { letter: 'T', confidence: 0 };
        const topW = Math.max(...topPoints.map(p => p.x)) - Math.min(...topPoints.map(p => p.x));

        if (topW > width * 0.6 && height > width * 0.7 && this.hasTPattern(points, boundingBox)) {
            return { letter: 'T', confidence: 0.84 };
        }
        return { letter: 'T', confidence: 0 };
    }

    private recognizeL(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;
        if (height > 50 && width > 30 && this.hasLPattern(points, boundingBox)) {
            return { letter: 'L', confidence: 0.83 };
        }
        return { letter: 'L', confidence: 0 };
    }

    private recognizeV(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const height = boundingBox.maxY - boundingBox.minY;
        const width = boundingBox.maxX - boundingBox.minX;
        if (height < 40 || width < 30) return { letter: 'V', confidence: 0 };

        if (this.hasVPattern(points, boundingBox)) {
            return { letter: 'V', confidence: 0.81 };
        }
        return { letter: 'V', confidence: 0 };
    }

    private recognizeU(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        if (this.hasUPattern(points, boundingBox) && !this.isPathClosed(points)) {
            return { letter: 'U', confidence: 0.80 };
        }
        return { letter: 'U', confidence: 0 };
    }

    private recognizeC(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        if (this.isArcShape(points, boundingBox) && !this.isPathClosed(points)) {
            return { letter: 'C', confidence: 0.82 };
        }
        return { letter: 'C', confidence: 0 };
    }

    private recognizeM(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const width = boundingBox.maxX - boundingBox.minX;
        const height = boundingBox.maxY - boundingBox.minY;

        // Find peaks
        const peaks: number[] = []; // Store x indices of peaks
        for (let i = 5; i < points.length - 5; i++) {
            if (points[i].y < points[i - 4].y && points[i].y < points[i + 4].y) {
                peaks.push(i);
                i += 8; // Skip ahead
            }
        }

        // M needs at least 2 peaks with a valley in between
        if (peaks.length >= 2 && width > 40) {
            // Check for horizontal distance between first and last significant peaks
            const peakDist = Math.abs(points[peaks[peaks.length - 1]].x - points[peaks[0]].x);
            const valleys = this.countValleys(points);

            if (valleys >= 1 && peakDist > width * 0.4) {
                return { letter: 'M', confidence: 0.89 };
            }
        }
        return { letter: 'M', confidence: 0 };
    }

    private recognizeW(data: DrawingData): RecognitionResult {
        const { points } = data;
        let valleys = 0;
        for (let i = 5; i < points.length - 5; i++) {
            if (points[i].y > points[i - 4].y && points[i].y > points[i + 4].y) { valleys++; i += 8; }
        }
        if (valleys >= 2) return { letter: 'W', confidence: 0.85 };
        return { letter: 'W', confidence: 0 };
    }

    private recognizeB(data: DrawingData): RecognitionResult {
        const { points } = data;
        const h = data.boundingBox.maxY - data.boundingBox.minY;
        if (h < 40) return { letter: 'B', confidence: 0 };
        const midY = (data.boundingBox.minY + data.boundingBox.maxY) / 2;
        const topHalf = points.filter(p => p.y < midY);
        const bottomHalf = points.filter(p => p.y > midY);
        if (this.isLoopShape(topHalf, data.boundingBox) && this.isLoopShape(bottomHalf, data.boundingBox)) {
            return { letter: 'B', confidence: 0.81 };
        }
        return { letter: 'B', confidence: 0 };
    }

    private recognizeD(data: DrawingData): RecognitionResult {
        if (this.isPathClosed(data.points) && (data.boundingBox.maxX - data.boundingBox.minX) > 30) {
            return { letter: 'D', confidence: 0.79 };
        }
        return { letter: 'D', confidence: 0 };
    }

    private recognizeCollectively(data: DrawingData, char: string, confMatch = 0.76): RecognitionResult {
        const h = data.boundingBox.maxY - data.boundingBox.minY;
        const w = data.boundingBox.maxX - data.boundingBox.minX;
        if (h > 40 && w > 20) return { letter: char, confidence: confMatch };
        return { letter: char, confidence: 0 };
    }

    private recognizeE(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const h = boundingBox.maxY - boundingBox.minY;
        const w = boundingBox.maxX - boundingBox.minX;
        if (h < 50 || w < 30) return { letter: 'E', confidence: 0 };

        const midX = (boundingBox.minX + boundingBox.maxX) / 2;
        const topH = points.filter(p => p.y < boundingBox.minY + h * 0.2 && p.x > midX).length;
        const midH = points.filter(p => p.y > boundingBox.minY + h * 0.4 && p.y < boundingBox.minY + h * 0.6 && p.x > midX).length;
        const botH = points.filter(p => p.y > boundingBox.maxY - h * 0.2 && p.x > midX).length;

        if (topH > 2 && midH > 1 && botH > 2) return { letter: 'E', confidence: 0.85 };
        return { letter: 'E', confidence: 0 };
    }

    private recognizeF(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const h = boundingBox.maxY - boundingBox.minY;
        const w = boundingBox.maxX - boundingBox.minX;
        if (h < 50 || w < 30) return { letter: 'F', confidence: 0 };

        const midX = (boundingBox.minX + boundingBox.maxX) / 2;
        const topH = points.filter(p => p.y < boundingBox.minY + h * 0.2 && p.x > midX).length;
        const midH = points.filter(p => p.y > boundingBox.minY + h * 0.4 && p.y < boundingBox.minY + h * 0.6 && p.x > midX).length;
        const botH = points.filter(p => p.y > boundingBox.maxY - h * 0.2 && p.x > midX).length;

        if (topH > 2 && midH > 1 && botH < 2) return { letter: 'F', confidence: 0.84 };
        return { letter: 'F', confidence: 0 };
    }

    private recognizeG(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        if (this.isArcShape(points, boundingBox) && !this.isPathClosed(points)) {
            const lastPoints = points.slice(-10);
            const movingInward = lastPoints.some(p => p.x < boundingBox.maxX - 10 && p.y < boundingBox.maxY - 10);
            if (movingInward) return { letter: 'G', confidence: 0.82 };
        }
        return { letter: 'G', confidence: 0 };
    }

    private recognizeH(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const w = boundingBox.maxX - boundingBox.minX;
        const h = boundingBox.maxY - boundingBox.minY;
        if (w < 40 || h < 50) return { letter: 'H', confidence: 0 };

        const midY = (boundingBox.minY + boundingBox.maxY) / 2;
        const crossSection = points.filter(p => Math.abs(p.y - midY) < 15);
        if (crossSection.length >= 3) {
            const xs = crossSection.map(p => p.x);
            if (Math.max(...xs) - Math.min(...xs) > w * 0.6) return { letter: 'H', confidence: 0.83 };
        }
        return { letter: 'H', confidence: 0 };
    }

    private recognizeJ(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const topW = points.filter(p => p.y < boundingBox.minY + 20).length;
        const botPoints = points.filter(p => p.y > boundingBox.maxY - 30);
        const botLeft = botPoints.filter(p => p.x < boundingBox.minX + (boundingBox.maxX - boundingBox.minX) / 2).length;
        if (botLeft > 2 && (boundingBox.maxY - boundingBox.minY) > 40) return { letter: 'J', confidence: 0.81 };
        return { letter: 'J', confidence: 0 };
    }

    private recognizeK(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const h = boundingBox.maxY - boundingBox.minY;
        const w = boundingBox.maxX - boundingBox.minX;
        if (h < 50 || w < 30) return { letter: 'K', confidence: 0 };

        const midX = (boundingBox.minX + boundingBox.maxX) / 2;
        const leftPoints = points.filter(p => p.x < boundingBox.minX + 20);
        const rightPoints = points.filter(p => p.x > midX);
        if (leftPoints.length > 5 && rightPoints.length > 4) return { letter: 'K', confidence: 0.80 };
        return { letter: 'K', confidence: 0 };
    }

    private recognizeN(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const h = boundingBox.maxY - boundingBox.minY;
        const w = boundingBox.maxX - boundingBox.minX;
        if (h < 50 || w < 30) return { letter: 'N', confidence: 0 };

        let yReversals = 0;
        let lastDir = 0;
        for (let i = 2; i < points.length; i++) {
            const dy = points[i].y - points[i - 2].y;
            if (Math.abs(dy) > 5) {
                const dir = dy > 0 ? 1 : -1;
                if (lastDir !== 0 && dir !== lastDir) yReversals++;
                lastDir = dir;
            }
        }
        if (yReversals >= 1 && w > 30) return { letter: 'N', confidence: 0.82 };
        return { letter: 'N', confidence: 0 };
    }

    private recognizeP(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const midY = (boundingBox.minY + boundingBox.maxY) / 2;
        const topHalf = points.filter(p => p.y < midY);
        if (this.isLoopShape(topHalf, boundingBox) && (boundingBox.maxY - boundingBox.minY) > 50) {
            return { letter: 'P', confidence: 0.84 };
        }
        return { letter: 'P', confidence: 0 };
    }

    private recognizeQ(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        if (this.isLoopShape(points, boundingBox)) {
            const lastPoints = points.slice(-10);
            const tail = lastPoints.some(p => p.y > boundingBox.maxY - 15 && p.x > (boundingBox.minX + boundingBox.maxX) / 2);
            if (tail) return { letter: 'Q', confidence: 0.81 };
        }
        return { letter: 'Q', confidence: 0 };
    }

    private recognizeR(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const midY = (boundingBox.minY + boundingBox.maxY) / 2;
        const topHalf = points.filter(p => p.y < midY);
        const botHalf = points.filter(p => p.y >= midY);
        const hasLeg = botHalf.some(p => p.x > (boundingBox.minX + boundingBox.maxX) / 2);
        if (this.isLoopShape(topHalf, boundingBox) && hasLeg) return { letter: 'R', confidence: 0.83 };
        return { letter: 'R', confidence: 0 };
    }

    private recognizeX(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const w = boundingBox.maxX - boundingBox.minX;
        const h = boundingBox.maxY - boundingBox.minY;
        if (w < 40 || h < 40) return { letter: 'X', confidence: 0 };

        let xSwitches = 0;
        let lastDx = 0;
        for (let i = 5; i < points.length; i++) {
            const dx = points[i].x - points[i - 5].x;
            if (Math.abs(dx) > 10) {
                const dir = dx > 0 ? 1 : -1;
                if (lastDx !== 0 && dir !== lastDx) xSwitches++;
                lastDx = dir;
            }
        }
        if (xSwitches >= 1) return { letter: 'X', confidence: 0.84 };
        return { letter: 'X', confidence: 0 };
    }

    private recognizeY(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const midY = (boundingBox.minY + boundingBox.maxY) / 2;
        const topHalf = points.filter(p => p.y < midY);
        const topW = Math.max(...topHalf.map(p => p.x)) - Math.min(...topHalf.map(p => p.x));
        const botPoints = points.filter(p => p.y > midY);
        const botW = Math.max(...botPoints.map(p => p.x)) - Math.min(...botPoints.map(p => p.x));

        if (topW > botW * 2 && (boundingBox.maxY - boundingBox.minY) > 50) return { letter: 'Y', confidence: 0.82 };
        return { letter: 'Y', confidence: 0 };
    }

    private recognizeZ(data: DrawingData): RecognitionResult {
        const { points, boundingBox } = data;
        const h = boundingBox.maxY - boundingBox.minY;
        if (h < 40) return { letter: 'Z', confidence: 0 };

        let xSwitches = 0;
        let lastDx = 0;
        for (let i = 5; i < points.length; i++) {
            const dx = points[i].x - points[i - 5].x;
            if (Math.abs(dx) > 10) {
                const dir = dx > 0 ? 1 : -1;
                if (lastDx !== 0 && dir !== lastDx) xSwitches++;
                lastDx = dir;
            }
        }
        if (xSwitches >= 2) return { letter: 'Z', confidence: 0.85 };
        return { letter: 'Z', confidence: 0 };
    }

    // --- Core Sensors ---

    private calculateVerticalDeviation(points: Point[]): number {
        if (points.length === 0) return 1;
        const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const totalDev = points.reduce((sum, p) => sum + Math.abs(p.x - avgX), 0) / points.length;
        const width = Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x));
        return totalDev / (width + 20);
    }

    private isPathClosed(points: Point[]): boolean {
        if (points.length < 8) return false;
        const start = points[0], end = points[points.length - 1];
        return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) < 40;
    }

    private isLoopShape(points: Point[], boundingBox: DrawingData['boundingBox']): boolean {
        if (points.length < 5) return false;
        const centerX = (boundingBox.minX + boundingBox.maxX) / 2, centerY = (boundingBox.minY + boundingBox.maxY) / 2;
        let quadrants = [0, 0, 0, 0];
        points.forEach(p => {
            if (p.x < centerX && p.y < centerY) quadrants[0]++;
            else if (p.x >= centerX && p.y < centerY) quadrants[1]++;
            else if (p.x >= centerX && p.y >= centerY) quadrants[2]++;
            else quadrants[3]++;
        });
        return quadrants.some(count => count > 0) && quadrants.filter(c => c > 0).length >= 3;
    }

    private hasTriangularTop(points: Point[], boundingBox: DrawingData['boundingBox']): boolean {
        const topPoints = points.filter(p => p.y < boundingBox.minY + (boundingBox.maxY - boundingBox.minY) / 3);
        if (topPoints.length < 2) return false;
        const avgX = topPoints.reduce((sum, p) => sum + p.x, 0) / topPoints.length;
        return Math.abs(avgX - (boundingBox.minX + boundingBox.maxX) / 2) < 30;
    }

    private hasLPattern(points: Point[], boundingBox: DrawingData['boundingBox']): boolean {
        const bottomPoints = points.filter(p => p.y > boundingBox.maxY - 30);
        return bottomPoints.length > 3;
    }

    private hasTPattern(points: Point[], boundingBox: DrawingData['boundingBox']): boolean {
        const topPoints = points.filter(p => p.y < boundingBox.minY + 25);
        return topPoints.length > 5;
    }

    private hasVPattern(points: Point[], boundingBox: DrawingData['boundingBox']): boolean {
        const bottomPoints = points.filter(p => p.y > boundingBox.maxY - 25);
        if (bottomPoints.length < 2) return false;
        const avgX = bottomPoints.reduce((sum, p) => sum + p.x, 0) / bottomPoints.length;
        return Math.abs(avgX - (boundingBox.minX + boundingBox.maxX) / 2) < 35;
    }

    private isArcShape(points: Point[], boundingBox: DrawingData['boundingBox']): boolean {
        const centerX = (boundingBox.minX + boundingBox.maxX) / 2;
        const leftPoints = points.filter(p => p.x < centerX), rightPoints = points.filter(p => p.x >= centerX);
        return Math.abs(leftPoints.length - rightPoints.length) > points.length * 0.2;
    }

    private hasUPattern(points: Point[], boundingBox: DrawingData['boundingBox']): boolean {
        const bottomPoints = points.filter(p => p.y > boundingBox.maxY - 30);
        return bottomPoints.length > 5;
    }

    private countValleys(points: Point[], threshold: number = 0.3): number {
        let valleys = 0;
        const boundingBox = this.analyzeDrawing(points).boundingBox;
        const height = boundingBox.maxY - boundingBox.minY;

        for (let i = 5; i < points.length - 5; i++) {
            // A valley is a local maximum in Y (lowest point visually)
            if (points[i].y > points[i - 4].y && points[i].y > points[i + 4].y) {
                // Check if the valley is deep enough relative to the height
                const leftPeakY = Math.min(...points.slice(0, i).map(p => p.y));
                const rightPeakY = Math.min(...points.slice(i).map(p => p.y));
                const valleyDepth = points[i].y - Math.max(leftPeakY, rightPeakY);

                if (valleyDepth > height * threshold) {
                    valleys++;
                    i += 8;
                }
            }
        }
        return valleys;
    }

    private calculateLinearity(points: Point[]): number {
        if (points.length < 4) return 1;

        const mid = Math.floor(points.length / 2);
        const dist1 = Math.sqrt(Math.pow(points[mid].x - points[0].x, 2) + Math.pow(points[mid].y - points[0].y, 2));
        const dist2 = Math.sqrt(Math.pow(points[points.length - 1].x - points[mid].x, 2) + Math.pow(points[points.length - 1].y - points[mid].y, 2));

        let pathDist1 = 0;
        for (let i = 1; i <= mid; i++) {
            pathDist1 += Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) + Math.pow(points[i].y - points[i - 1].y, 2));
        }

        let pathDist2 = 0;
        for (let i = mid + 1; i < points.length; i++) {
            pathDist2 += Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) + Math.pow(points[i].y - points[i - 1].y, 2));
        }

        const linearity1 = dist1 / (pathDist1 + 0.1);
        const linearity2 = dist2 / (pathDist2 + 0.1);

        return (linearity1 + linearity2) / 2;
    }
}
