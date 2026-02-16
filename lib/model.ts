import * as tf from '@tensorflow/tfjs';
import { RecognitionResult } from './types';

let model: tf.LayersModel | null = null;
const MODEL_URL = '/model/model.json';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

/**
 * Loads the EMNIST alphabet model from the public directory.
 * Caches the model instance to prevent redundant loads.
 */
export async function loadModel(): Promise<tf.LayersModel> {
    if (model) return model;

    try {
        console.log('Loading TensorFlow.js model from:', MODEL_URL);
        model = await tf.loadLayersModel(MODEL_URL);
        console.log('Model loaded successfully');
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

/**
 * Predicts the alphabet character drawn on the canvas.
 */
export async function predictAlphabet(tensor: tf.Tensor4D): Promise<RecognitionResult> {
    const loadedModel = await loadModel();

    const output = loadedModel.predict(tensor) as tf.Tensor;
    const data = await output.data();

    // Find index with highest confidence
    let maxIdx = 0;
    let maxVal = -1;
    for (let i = 0; i < data.length; i++) {
        if (data[i] > maxVal) {
            maxVal = data[i];
            maxIdx = i;
        }
    }

    // Free memory
    output.dispose();

    return {
        letter: ALPHABET[maxIdx] || '?',
        confidence: maxVal
    };
}
