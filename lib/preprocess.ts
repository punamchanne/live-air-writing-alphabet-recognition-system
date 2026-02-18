import * as tf from '@tensorflow/tfjs';
import { Point } from './types';

export function getBoundingBoxFromCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height).data;

    let minX = width, maxX = 0, minY = height, maxY = 0;
    let found = false;

    // Scan pixels for white (white strokes on black)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const alpha = imageData[(y * width + x) * 4 + 0]; // Looking at Red channel since white is 255,255,255
            if (alpha > 50) { // Threshold for stroke pixel
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }

    if (!found) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    // Add 10px padding to avoid clipping stroke caps
    return {
        minX: Math.max(0, minX - 10),
        maxX: Math.min(width, maxX + 10),
        minY: Math.max(0, minY - 10),
        maxY: Math.min(height, maxY + 10)
    };
}

/**
 * Preprocesses the drawing on a canvas for TensorFlow.js EMNIST model.
 * Steps: 
 * 1. Crop to bounding box.
 * 2. Scale to fit within a 20x20 area (preserving aspect ratio).
 * 3. Center strictly within a 28x28 frame (4px padding).
 * 4. Perform Center of Mass (CoM) centering for EMNIST compatibility.
 */
export async function preprocessCanvas(
    sourceCanvas: HTMLCanvasElement,
    _points: Point[], // Kept for interface compatibility
    options: { strokeWidth?: number } = {}
): Promise<tf.Tensor4D> {
    const box = getBoundingBoxFromCanvas(sourceCanvas);
    const width = box.maxX - box.minX;
    const height = box.maxY - box.minY;

    // Use a temporary canvas to draw the character at 28x28
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) throw new Error('Could not get 2d context');

    // EMNIST: Black background
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, 28, 28);

    if (width > 0 && height > 0) {
        // Uniform Scaling (Aspect Ratio Preservation)
        const scale = 20 / Math.max(width, height);
        const scaledW = width * scale;
        const scaledH = height * scale;
        const offsetX = 4 + (20 - scaledW) / 2;
        const offsetY = 4 + (20 - scaledH) / 2;

        tempCtx.drawImage(
            sourceCanvas,
            box.minX, box.minY, width, height, // Source crop
            offsetX, offsetY, scaledW, scaledH   // Target fit
        );
    }

    // 2. Convert to Tensor and perform Mass-Centering
    const rawTensor = tf.tidy(() => {
        return tf.browser.fromPixels(tempCanvas, 1).toFloat().div(tf.scalar(255));
    });

    // Center of Mass centering
    const [m10, m01, m00] = tf.tidy(() => {
        const yCoords = tf.linspace(0, 27, 28).reshape([28, 1]);
        const xCoords = tf.linspace(0, 27, 28).reshape([1, 28]);

        const totalMass = rawTensor.sum();
        const centerX = rawTensor.mul(xCoords).sum().div(totalMass);
        const centerY = rawTensor.mul(yCoords).sum().div(totalMass);

        return [centerX, centerY, totalMass];
    });

    const massData = await Promise.all([m10.data(), m01.data(), m00.data()]);
    const cx = massData[0][0];
    const cy = massData[1][0];
    const totalM = massData[2][0];

    // Dispose calculation tensors
    m10.dispose(); m01.dispose(); m00.dispose();

    const finalTensor = tf.tidy(() => {
        let tensor = rawTensor;

        // Shift CoM to (14, 14)
        const dx = 14 - cx;
        const dy = 14 - cy;

        // Apply translation for better alignment
        if (totalM > 0.05) {
            const shiftX = Math.round(dx);
            const shiftY = Math.round(dy);

            if (Math.abs(shiftX) > 0 || Math.abs(shiftY) > 0) {
                // Pad and slice to "shift" the image within the 28x28 bounds
                const padded = tensor.pad([
                    [Math.max(0, shiftY), Math.max(0, -shiftY)],
                    [Math.max(0, shiftX), Math.max(0, -shiftX)],
                    [0, 0]
                ]) as tf.Tensor3D;

                const startY = shiftY > 0 ? 0 : -shiftY;
                const startX = shiftX > 0 ? 0 : -shiftX;
                tensor = padded.slice([startY, startX, 0], [28, 28, 1]) as tf.Tensor3D;
            }
        }

        // Standard Row-Major (No Transpose)
        // Some models require transpose, but we're testing baseline first.
        return tensor.expandDims(0) as tf.Tensor4D;
    });

    // Discard raw tensor if it was replaced or no longer needed
    if (finalTensor.squeeze().id !== rawTensor.id) {
        rawTensor.dispose();
    }

    return finalTensor;
}
