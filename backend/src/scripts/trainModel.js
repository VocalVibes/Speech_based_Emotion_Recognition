import { trainModel } from '../services/emotionService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const trainingDataPath = path.join(__dirname, '../../data/training');

async function main() {
  try {
    console.log('Starting model training...');
    const result = await trainModel(trainingDataPath);
    console.log('Model training completed:', result);
  } catch (error) {
    console.error('Error during model training:', error);
    process.exit(1);
  }
}

main(); 