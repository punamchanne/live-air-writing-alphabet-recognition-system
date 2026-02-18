import { Point, RecognitionResult } from './types';
import { TEMPLATES, UnistrokeTemplate } from './templates';

// $1 Unistroke Recognizer Constants
const NUM_POINTS = 64;
const SQUARE_SIZE = 250.0;
const ORIGIN = { x: 0, y: 0, timestamp: 0 };
const DIAGONAL = Math.sqrt(SQUARE_SIZE * SQUARE_SIZE + SQUARE_SIZE * SQUARE_SIZE);
const HALF_DIAGONAL = 0.5 * DIAGONAL;
const ANGLE_RANGE = 45.0; // +/- 45 degrees
const ANGLE_STEP = 2.0;
const PHI = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio

export class AlphabetRecognizer {
    private templates: UnistrokeTemplate[];

    constructor() {
        this.templates = TEMPLATES.map(t => ({
            name: t.name,
            points: this.normalize(t.points)
        }));
    }

    // --- Public API ---
    recognize(points: Point[]): RecognitionResult {
        if (points.length < 5) return { letter: '?', confidence: 0 };

        const normalizedPoints = this.normalize(points);
        let bestDistance = Infinity;
        let bestTemplate = null;

        for (const template of this.templates) {
            const d = this.distanceAtBestAngle(normalizedPoints, template.points, -ANGLE_RANGE, ANGLE_RANGE, ANGLE_STEP);
            if (d < bestDistance) {
                bestDistance = d;
                bestTemplate = template;
            }
        }

        if (bestTemplate) {
            const score = 1.0 - (bestDistance / HALF_DIAGONAL);
            return {
                letter: bestTemplate.name,
                confidence: Math.max(0, score),
                mode: 'live' // Default, will be overridden by caller
            };
        }

        return { letter: '?', confidence: 0 };
    }

    // --- Core Pipeline ---
    private normalize(points: Point[]): Point[] {
        let pts = this.resample(points, NUM_POINTS);
        const radians = this.indicateAngle(pts);
        pts = this.rotateBy(pts, -radians);
        pts = this.scaleTo(pts, SQUARE_SIZE);
        pts = this.translateTo(pts, ORIGIN);
        return pts;
    }

    // --- Geometric Steps ---
    private resample(points: Point[], n: number): Point[] {
        const I = this.pathLength(points) / (n - 1);
        let D = 0.0;
        const newPoints = [points[0]];
        for (let i = 1; i < points.length; i++) {
            const d = this.distance(points[i - 1], points[i]);
            if ((D + d) >= I) {
                const qx = points[i - 1].x + ((I - D) / d) * (points[i].x - points[i - 1].x);
                const qy = points[i - 1].y + ((I - D) / d) * (points[i].y - points[i - 1].y);
                const q = { x: qx, y: qy, timestamp: 0 };
                newPoints.push(q);
                points.splice(i, 0, q); // Insert 'q' at position i in points s.t. 'q' will be the next i
                D = 0.0;
            } else {
                D += d;
            }
        }
        if (newPoints.length === n - 1) {
            newPoints.push(points[points.length - 1]);
        }
        return newPoints;
    }

    private indicateAngle(points: Point[]): number {
        const c = this.centroid(points);
        return Math.atan2(c.y - points[0].y, c.x - points[0].x);
    }

    private rotateBy(points: Point[], radians: number): Point[] {
        const c = this.centroid(points);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return points.map(p => ({
            x: (p.x - c.x) * cos - (p.y - c.y) * sin + c.x,
            y: (p.x - c.x) * sin + (p.y - c.y) * cos + c.y,
            timestamp: 0
        }));
    }

    private scaleTo(points: Point[], size: number): Point[] {
        const b = this.boundingBox(points);
        return points.map(p => ({
            x: p.x * (size / b.width),
            y: p.y * (size / b.height),
            timestamp: 0
        }));
    }

    private translateTo(points: Point[], pt: Point): Point[] {
        const c = this.centroid(points);
        return points.map(p => ({
            x: p.x + pt.x - c.x,
            y: p.y + pt.y - c.y,
            timestamp: 0
        }));
    }

    // --- Matching ---
    private distanceAtBestAngle(points: Point[], T: Point[], a: number, b: number, threshold: number): number {
        let x1 = PHI * a + (1.0 - PHI) * b;
        let f1 = this.distanceAtAngle(points, T, x1);
        let x2 = (1.0 - PHI) * a + PHI * b;
        let f2 = this.distanceAtAngle(points, T, x2);
        while (Math.abs(b - a) > threshold) {
            if (f1 < f2) {
                b = x2;
                x2 = x1;
                f2 = f1;
                x1 = PHI * a + (1.0 - PHI) * b;
                f1 = this.distanceAtAngle(points, T, x1);
            } else {
                a = x1;
                x1 = x2;
                f1 = f2;
                x2 = (1.0 - PHI) * a + PHI * b;
                f2 = this.distanceAtAngle(points, T, x2);
            }
        }
        return Math.min(f1, f2);
    }

    private distanceAtAngle(points: Point[], T: Point[], radians: number): number {
        const newPoints = this.rotateBy(points, radians);
        return this.pathDistance(newPoints, T);
    }

    private pathDistance(pts1: Point[], pts2: Point[]): number {
        let d = 0.0;
        for (let i = 0; i < pts1.length; i++) {
            d += this.distance(pts1[i], pts2[i]);
        }
        return d / pts1.length;
    }

    // --- Helpers ---
    private pathLength(points: Point[]): number {
        let d = 0.0;
        for (let i = 1; i < points.length; i++) {
            d += this.distance(points[i - 1], points[i]);
        }
        return d;
    }

    private distance(p1: Point, p2: Point): number {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private centroid(points: Point[]): Point {
        let x = 0.0, y = 0.0;
        for (const p of points) { x += p.x; y += p.y; }
        return { x: x / points.length, y: y / points.length, timestamp: 0 };
    }

    private boundingBox(points: Point[]) {
        let minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
        for (const p of points) {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        }
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
}
