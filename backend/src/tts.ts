import * as ElevenLabs from 'elevenlabs-node';
import path from 'path';
import fs from 'fs-extra';
import { TTS_PATH } from './const.js';
const API_KEY = process.env.ELEVENLABS_API_KEY;

(async () => {
	await fs.ensureDir(TTS_PATH);
})();

export const getRandomVoice = async () => {
	try {
		const response = await ElevenLabs.getVoices(API_KEY);
		const { voices } = response;
		const randomIndex = Math.floor(Math.random() * voices.length);
		const randomVoice = voices[randomIndex];
		return randomVoice;
	} catch (error) {
		console.error('Error in getting random voice:', error);
	}
};

export const getVoiceById = async (voiceId: string) => {
	try {
		const response = await ElevenLabs.getVoices(API_KEY);
		const { voices } = response;
		const voice = voices.find((voice) => voice.id === voiceId);
		return voice;
	} catch (error) {
		console.error('Error in getting voice by id:', error);
	}
};

export const getVoiceByName = async (voiceName: string) => {
	try {
		const response = await ElevenLabs.getVoices(API_KEY);
		const { voices } = response;
		const voice = voices.find((voice) => voice.name === voiceName);
		return voice;
	} catch (error) {
		console.error('Error in getting voice by name:', error);
	}
};

export const convertTextToSpeech = async (voiceId: string, text: string) => {
	try {
		const fileName = `${Date.now()}.mp3`;
		const filePath = path.join(TTS_PATH, fileName);
		await ElevenLabs.textToSpeech(API_KEY, voiceId, filePath, text);
		return fileName;
	} catch (error) {
		console.error('Error in converting text to speech:', error);
		throw error;
	}
};
