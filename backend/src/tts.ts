import * as ElevenLabs from 'elevenlabs-node';
import path from 'path';
import fs from 'fs-extra';
import { TTS_PATH } from './const.js';
import { Voice } from '../../shared/typesElevenLabs.js';
const API_KEY = process.env.ELEVENLABS_API_KEY;

let voices: Voice[] = [];

export const getVoices = async (): Promise<Voice[] | null> => {
	try {
		const response = await ElevenLabs.getVoices(API_KEY);
		const { voices } = response;
		return voices;
	} catch (error) {
		console.error('Error in getting voices:', error);
		return null;
	}
};

export const getRandomVoice = async (): Promise<Voice | null> => {
	const randomIndex = Math.floor(Math.random() * voices.length);
	const randomVoice: Voice = voices[randomIndex];
	return randomVoice;
};

export const getVoiceById = async (voiceId: string): Promise<Voice | null> => {
	const voice = voices.find((voice) => voice.voice_id === voiceId);
	if (!voice) {
		console.error('Error in getting voice by id:', voiceId);
		return null;
	}
};

export const getVoiceByName = async (
	voiceName: string
): Promise<Voice | null> => {
	const voice = voices.find((voice) => voice.name === voiceName);
	if (!voice) {
		console.error('Error in getting voice by name:', voiceName);
		return null;
	}
};

export const convertTextToSpeech = async (
	voiceId: string,
	text: string
): Promise<string> => {
	try {
		const fileName = `${Date.now()}.mp3`;
		const filePath = path.join(TTS_PATH, fileName);
		// (apiKey, voiceID, fileName, textInput, stability, similarityBoost, modelId)
		await ElevenLabs.textToSpeech(API_KEY, voiceId, filePath, text, 0.25);
		return fileName;
	} catch (error) {
		console.error('Error in converting text to speech:', error);
		throw error;
	}
};

(async () => {
	await fs.ensureDir(TTS_PATH);

	voices = (await getVoices()) || [];
})();
