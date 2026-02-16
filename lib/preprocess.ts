import * as tf from '@tensorflow/tfjs';
import { Point } from './types';

export function getBoundingBox(points: Point[]) {
    if (points.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
    };
}

/**
 * Preprocesses the drawing on a canvas for TensorFlow.js EMNIST model.
 * Steps: Draw points clearly, Crop to bounding box, pad, center, resize to 28x28, grayscale, normalize.
 */
export async function preprocessCanvas(canvas: HTMLCanvasElement, points: Point[]): Promise<tf.Tensor4D> {
    const box = getBoundingBox(points);
    const width = box.maxX - box.minX;
    const height = box.maxY - box.minY;

    // 1. Create a temporary canvas for internal rendering (ensure high contrast for ML)
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) throw new Error('Could not get 2d context');

    // Add padding for normalization
    const padding = 30;
    const size = Math.max(width, height) + padding * 2;
    tempCanvas.width = size;
    tempCanvas.height = size;

    // EMNIST: Black background (0)
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, size, size);

    // Draw the character in WHITE (binary high contrast)
    tempCtx.strokeStyle = 'white';
    tempCtx.lineWidth = Math.max(12, size / 10); // Dynamic line weight relative to drawing size
    tempCtx.lineCap = 'round';
    tempCtx.lineJoin = 'round';

    const offsetX = (size - width) / 2 - box.minX;
    const offsetY = (size - height) / 2 - box.minY;

    if (points.length > 1) {
        tempCtx.beginPath();
        tempCtx.moveTo(points[0].x + offsetX, points[0].y + offsetY);
        for (let i = 1; i < points.length; i++) {
            tempCtx.lineTo(points[i].x + offsetX, points[i].y + offsetY);
        }
        tempCtx.stroke();
    }

    // 2. Convert to Tensor
    return tf.tidy(() => {
        // Convert canvas image to tensor (1 channel for grayscale)
        let tensor = tf.browser.fromPixels(tempCanvas, 1);

        // Resize to 28x28 (Standard EMNIST size)
        tensor = tf.image.resizeBilinear(tensor, [28, 28]);

        // Normalize to 0-1
        tensor = tensor.toFloat().div(tf.scalar(255));

        // Add batch dimension: [1, 28, 28, 1]
        return tensor.expandDims(0) as tf.Tensor4D;
    });
}
