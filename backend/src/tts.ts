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
		console.log('Voices:', voices);

		const randomIndex = Math.floor(Math.random() * voices.length);
		const randomVoice = voices[randomIndex];

		return randomVoice;
	} catch (error) {
		console.error('Error in getting random voice:', error);
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
