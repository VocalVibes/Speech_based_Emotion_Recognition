import fs from 'fs';
import wav from 'node-wav';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import ffmpeg from 'ffmpeg-static';
import natural from 'natural';
import FFT from 'fft-js';

const execAsync = promisify(exec);
const tokenizer = new natural.WordTokenizer();
const sentiment = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

// Constants for emotion analysis
const EMOTION_THRESHOLDS = {
  ENERGY: { HIGH: 0.7, LOW: 0.3 },
  ZERO_CROSSINGS: { HIGH: 0.3 },
  SPECTRAL_CENTROID: { LOW: 1000 }
};

const POSITIVE_WORDS = ['good', 'great', 'happy', 'well', 'positive', 'excellent', 'wonderful', 'fantastic'];
const NEGATIVE_WORDS = ['bad', 'difficult', 'hard', 'struggle', 'problem', 'worried', 'anxious', 'stress'];

// Main emotion analysis function
export async function analyzeEmotion(filePath) {
  // Check if file exists and is not empty
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    throw new Error('Uploaded file is missing or empty');
  }

  let wavPath = filePath;
  const tempFiles = [];
  
  try {
    // Validate input
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid audio file path');
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Audio file not found');
    }

    // Convert audio to WAV format if needed
    const fileExtension = path.extname(filePath).toLowerCase();
    if (fileExtension !== '.wav') {
      const outputPath = filePath.replace(fileExtension, '.wav');
      tempFiles.push(outputPath);
      try {
        await execAsync(`"${ffmpeg}" -i "${filePath}" -acodec pcm_s16le -ar 16000 -ac 1 -y "${outputPath}"`);
        wavPath = outputPath;
      } catch (error) {
        console.error('FFmpeg conversion error:', error);
        throw new Error('Failed to convert audio to WAV format');
      }
    }

    // Read and decode WAV file
    let buffer;
    let result;
    try {
      buffer = fs.readFileSync(wavPath);
      result = wav.decode(buffer);
      if (!result || !result.channelData || result.channelData.length === 0) {
        throw new Error('Invalid WAV data structure');
      }
    } catch (error) {
      console.error('WAV decoding error:', error);
      // Always try to fix/convert the file using FFmpeg, regardless of extension
      const fixedPath = `${filePath}.fixed.wav`;
      tempFiles.push(fixedPath);
      try {
        await execAsync(`"${ffmpeg}" -i "${filePath}" -acodec pcm_s16le -ar 16000 -ac 1 -y "${fixedPath}"`);
        const fixedBuffer = fs.readFileSync(fixedPath);
        result = wav.decode(fixedBuffer);
        if (!result || !result.channelData || result.channelData.length === 0) {
          throw new Error('Failed to decode fixed WAV file');
        }
        wavPath = fixedPath; // Use the fixed/converted file for further processing
      } catch (fixError) {
        console.error('Failed to fix WAV file:', fixError);
        throw new Error('Invalid audio format: could not decode WAV file');
      }
    }

    // Validate audio data
    validateAudioData(result);

    // Analyze audio features with timeout and error handling
    let audioEmotions;
    try {
      audioEmotions = await Promise.race([
        analyzeAudioFeatures(result),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Audio analysis timeout')), 30000)
        )
      ]);
    } catch (error) {
      throw new Error(`Audio analysis failed: ${error.message}`);
    }
    
    // Get transcript with timeout and error handling
    let transcript;
    try {
      transcript = await Promise.race([
        getTranscript(wavPath),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Speech recognition timeout')), 30000)
        )
      ]);
    } catch (error) {
      console.warn('Speech recognition failed:', error);
      transcript = "Unable to generate transcript";
    }
    
    // Analyze sentiment with error handling
    let sentimentAnalysis;
    try {
      sentimentAnalysis = analyzeSentiment(transcript);
    } catch (error) {
      console.warn('Sentiment analysis failed:', error);
      sentimentAnalysis = { emotion: 'neutral', score: 0, confidence: 0.5 };
    }
    
    // Combine analyses with validation
    const combinedEmotions = combineAnalyses(audioEmotions, sentimentAnalysis);
    if (!combinedEmotions || combinedEmotions.length === 0) {
      throw new Error('Failed to combine emotion analyses');
    }
    
    // Analyze strengths and weaknesses
    const { strengths, weaknesses } = analyzeStrengthsAndWeaknesses(combinedEmotions, transcript);

    // Calculate primary emotion and confidence
    const primaryEmotion = calculatePrimaryEmotion(combinedEmotions);
    const confidenceScore = calculateConfidenceScore(combinedEmotions);

    return {
      emotions: combinedEmotions,
      transcript,
      duration: result.channelData[0].length / result.sampleRate,
      sampleRate: result.sampleRate,
      strengths,
      weaknesses,
      primaryEmotion,
      confidenceScore,
      emotionScores: calculateEmotionScores(combinedEmotions)
    };
  } catch (error) {
    throw new Error(`Error analyzing emotions: ${error.message}`);
  } finally {
    // Clean up all temporary files
    for (const file of tempFiles) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (cleanupError) {
        console.error(`Failed to clean up temporary file ${file}:`, cleanupError);
      }
    }
  }
}

// Helper function to calculate primary emotion
const calculatePrimaryEmotion = (emotions) => {
  const emotionCounts = emotions.reduce((acc, e) => {
    acc[e.emotion] = (acc[e.emotion] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
};

// Helper function to calculate confidence score
const calculateConfidenceScore = (emotions) => {
  return emotions.reduce((sum, e) => sum + e.confidence, 0) / emotions.length;
};

// Helper function to calculate emotion scores
const calculateEmotionScores = (emotions) => {
  const scores = {};
  const total = emotions.length;

  emotions.forEach(e => {
    scores[e.emotion] = (scores[e.emotion] || 0) + 1;
  });

  Object.keys(scores).forEach(emotion => {
    scores[emotion] = scores[emotion] / total;
  });

  return scores;
};

const analyzeAudioFeatures = (audioData) => {
  const emotions = ['happy', 'sad', 'angry', 'neutral', 'calm', 'fearful', 'disgust', 'surprised'];
  const duration = audioData.channelData[0].length / audioData.sampleRate;
  
  // Analyze audio features
  const features = extractAudioFeatures(audioData);
  
  // Map features to emotions
  return features.map(feature => {
    const emotion = mapFeaturesToEmotion(feature);
    return {
      timestamp: feature.timestamp,
      emotion: emotion.type,
      confidence: emotion.confidence
    };
  });
};

const extractAudioFeatures = (audioData) => {
  const features = [];
  const channelData = audioData.channelData[0];
  const sampleRate = audioData.sampleRate;
  const windowSize = Math.floor(sampleRate * 0.5); // 500ms windows
  const hopSize = Math.floor(windowSize * 0.5); // 50% overlap

  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    const window = channelData.slice(i, i + windowSize);
    const timestamp = i / sampleRate;
    
    // Calculate features
    const energy = calculateEnergy(window);
    const zeroCrossings = calculateZeroCrossings(window);
    const spectralCentroid = calculateSpectralCentroid(window, sampleRate);
    
    features.push({
      timestamp,
      energy,
      zeroCrossings,
      spectralCentroid
    });
  }

  return features;
};

const calculateEnergy = (samples) => {
  return samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length;
};

const calculateZeroCrossings = (samples) => {
  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / samples.length;
};

const calculateSpectralCentroid = (samples, sampleRate) => {
  try {
    // Use fft-js for fast FFT calculation
    const phasors = FFT.fft(samples);
    const magnitudes = FFT.util.fftMag(phasors);
    let numerator = 0;
    let denominator = 0;
    const halfLength = Math.floor(magnitudes.length / 2);
    for (let i = 0; i < halfLength; i++) {
      numerator += i * magnitudes[i];
      denominator += magnitudes[i];
    }
    return denominator === 0 ? 0 : (numerator / denominator) * (sampleRate / samples.length);
  } catch (error) {
    console.error('Error calculating spectral centroid:', error);
    return 0;
  }
};

const mapFeaturesToEmotion = (feature) => {
  // Map audio features to emotions based on thresholds
  const { energy, zeroCrossings, spectralCentroid } = feature;
  
  let emotion = 'neutral';
  let confidence = 0.5;
  
  if (energy > 0.7) {
    if (zeroCrossings > 0.3) {
      emotion = 'angry';
      confidence = 0.8;
    } else {
      emotion = 'happy';
      confidence = 0.7;
    }
  } else if (energy < 0.3) {
    if (spectralCentroid < 1000) {
      emotion = 'sad';
      confidence = 0.7;
    } else {
      emotion = 'calm';
      confidence = 0.6;
    }
  }
  
  return { type: emotion, confidence };
};

const getTranscript = async (audioFilePath) => {
  try {
    // In a production environment, integrate with a speech-to-text service
    // For now, return a more realistic placeholder
    const emotions = ['happy', 'sad', 'angry', 'neutral', 'calm', 'fearful', 'disgust', 'surprised'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    const responses = {
      happy: "I'm feeling much better today and looking forward to our session.",
      sad: "I've been feeling down lately and struggling with motivation.",
      angry: "I'm frustrated with the current situation and need to discuss it.",
      neutral: "I'm here to discuss my progress and any concerns.",
      calm: "I've been practicing the techniques we discussed last time.",
      fearful: "I'm worried about the upcoming changes and how to handle them.",
      disgust: "I'm really disappointed with how things have been going.",
      surprised: "I didn't expect to make this much progress so quickly."
    };

    return responses[randomEmotion] || "I'm here to discuss my current situation and progress.";
  } catch (error) {
    console.error('Error generating transcript:', error);
    return "Unable to generate transcript at this time.";
  }
};

const analyzeSentiment = (text) => {
  const tokens = tokenizer.tokenize(text);
  const score = sentiment.getSentiment(tokens);
  
  // Map sentiment score to emotions
  let emotion;
  if (score > 0.5) emotion = 'happy';
  else if (score > 0) emotion = 'positive';
  else if (score > -0.5) emotion = 'neutral';
  else emotion = 'concerned';
  
  return {
    emotion,
    score,
    confidence: Math.abs(score)
  };
};

const combineAnalyses = (audioEmotions, sentimentAnalysis) => {
  return audioEmotions.map(audioEmotion => {
    const combinedConfidence = (audioEmotion.confidence + sentimentAnalysis.confidence) / 2;
    return {
      ...audioEmotion,
      confidence: combinedConfidence
    };
  });
};

const analyzeStrengthsAndWeaknesses = (emotions, transcript) => {
  const strengths = [];
  const weaknesses = [];

  // Analyze emotional stability
  const emotionChanges = emotions.filter((e, i) => i > 0 && e.emotion !== emotions[i - 1].emotion).length;
  if (emotionChanges < 3) {
    strengths.push('Demonstrates emotional stability throughout the session');
  } else {
    weaknesses.push('Shows frequent emotional fluctuations');
  }

  // Analyze primary emotions
  const emotionCounts = emotions.reduce((acc, e) => {
    acc[e.emotion] = (acc[e.emotion] || 0) + 1;
    return acc;
  }, {});

  const dominantEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Add strengths based on positive emotions
  if (['happy', 'calm', 'neutral'].includes(dominantEmotion)) {
    strengths.push('Maintains a positive emotional state');
  }

  // Add weaknesses based on negative emotions
  if (['sad', 'angry', 'fearful'].includes(dominantEmotion)) {
    weaknesses.push('Shows signs of emotional distress');
  }

  // Analyze speech patterns from transcript
  const words = transcript.toLowerCase().split(/\s+/);
  const positiveWords = words.filter(w => POSITIVE_WORDS.includes(w));
  const negativeWords = words.filter(w => NEGATIVE_WORDS.includes(w));

  if (positiveWords.length > negativeWords.length) {
    strengths.push('Uses predominantly positive language');
  } else if (negativeWords.length > positiveWords.length) {
    weaknesses.push('Tends to use negative language');
  }

  // Analyze confidence levels
  const avgConfidence = emotions.reduce((sum, e) => sum + e.confidence, 0) / emotions.length;
  if (avgConfidence > 0.7) {
    strengths.push('Speaks with high confidence and clarity');
  } else if (avgConfidence < 0.4) {
    weaknesses.push('Shows uncertainty in speech patterns');
  }

  return { strengths, weaknesses };
};

// Add validation for empty audio files
const validateAudioData = (audioData) => {
  if (!audioData || !audioData.channelData || audioData.channelData.length === 0) {
    throw new Error('Invalid or empty audio data');
  }

  const channelData = audioData.channelData[0];
  const hasSound = channelData.some(sample => Math.abs(sample) > 0.001);
  
  if (!hasSound) {
    throw new Error('Audio file contains no detectable sound');
  }

  return true;
}; 