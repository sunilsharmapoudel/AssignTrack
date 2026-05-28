import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { AudioModule } from 'expo-audio';

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

export interface TTSOptions {
  rate?: number;     // 0.1 – 2.0, default 0.9
  pitch?: number;    // 0.5 – 2.0, default 1.0
  language?: string; // BCP-47 tag e.g. 'en-US'
  onDone?: () => void;
  onError?: (error: string) => void;
}

export async function speakText(text: string, options: TTSOptions = {}): Promise<void> {
  const isSpeakingNow = await Speech.isSpeakingAsync();
  if (isSpeakingNow) await Speech.stop();

  Speech.speak(text, {
    rate: options.rate ?? 0.9,
    pitch: options.pitch ?? 1.0,
    language: options.language ?? 'en-US',
    onDone: options.onDone,
    onError: (err) => options.onError?.(String(err)),
  });
}

export async function stopSpeaking(): Promise<void> {
  await Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  return Speech.getAvailableVoicesAsync();
}

// ─── Microphone Permission ────────────────────────────────────────────────────

export async function requestMicrophonePermission(): Promise<boolean> {
  const status = await AudioModule.requestRecordingPermissionsAsync();
  return status.granted;
}

// ─── Voice Recording ─────────────────────────────────────────────────────────
// expo-audio's AudioRecorder requires the React component lifecycle (it's backed
// by a native module handle tied to useAudioRecorder). Use useAudioRecorder
// directly in the Notes screen — see app/notes.tsx.

export async function transcribeAudioUri(_uri: string): Promise<string> {
  // Production: send _uri to a transcription API (Google STT, Whisper, etc.)
  return '';
}
