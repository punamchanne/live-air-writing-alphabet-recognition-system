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
export async function predictAlphabet(tensor: tf.Tensor4D): Promise<RecognitionResult & { alternatives?: RecognitionResult[] }> {
    const loadedModel = await loadModel();

    const output = loadedModel.predict(tensor) as tf.Tensor;
    const data = await output.data();

    // Map probabilities to indexed objects
    // Map probabilities to indexed objects and filter out numbers
    const predictions = Array.from(data)
        .map((prob, idx) => ({
            letter: ALPHABET[idx] || '?',
            confidence: prob,
            mode: 'live' as const
        }))
        .filter(p => !/[0-9]/.test(p.letter)); // Exclude digits

    // Sort by confidence descending
    predictions.sort((a, b) => b.confidence - a.confidence);

    // Free memory
    output.dispose();

    return {
        ...predictions[0],
        alternatives: predictions.slice(1, 4) // Return next 3 best guesses
    };
}
