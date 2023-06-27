import * as ElevenLabs from 'elevenlabs-node';
import path from 'path';
import say from 'say';
import fs from 'fs-extra';
import { TTS_PATH } from './const.js';
import { Voice } from '../../shared/typesElevenLabs.js';
const API_KEY = process.env.ELEVENLABS_API_KEY;

export let voices: Voice[] = [];

function getSayVoices(): Promise<string[]> {
	return new Promise((resolve, reject) => {
		// @ts-ignore: the type definition is wrong, callback does actually take 2 args
		say.getInstalledVoices((err, voices) => {
			if (err) reject(err);
			resolve(voices);
		});
	});
}
async function getFixedSayVoices(): Promise<Voice[]> {
	const voices = await getSayVoices();
	return voices.map((voice) => {
		return {
			voice_id: 'saytts-' + voice.replace(/ /g, '_'),
			name: voice,
		} as any;
	});
}

export const getVoices = async (
	elevenlabsOnly = false
): Promise<Voice[] | null> => {
	try {
		const response = await ElevenLabs.getVoices(API_KEY);
		const { voices } = response;
		if (elevenlabsOnly) return voices;
		const sayVoices = await getFixedSayVoices();
		return [...voices, ...sayVoices];
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
	return voice;
};

export const getVoiceByName = async (
	voiceName: string
): Promise<Voice | null> => {
	const voice = voices.find((voice) => voice.name === voiceName);
	if (!voice) {
		console.error('Error in getting voice by name:', voiceName);
		return null;
	}
	return voice;
};

export const convertTextToSpeech = async (
	voiceId: string,
	text: string,
	type: 'chat' | 'tts',
	voiceStability = 0.25,
	voiceSimilarityBoost = 0.25
): Promise<string> => {
	try {
		const fileName = `${Date.now()}.mp3`;
		const filePath = path.join(TTS_PATH, type, fileName);
		console.log(filePath);
		if (voiceId.startsWith('saytts')) {
			const voiceName = voiceId.replace('saytts-', '').replace(/_/g, ' ');
			await sayTTSExport(text, voiceName, filePath);
			return `/tts/${type}/${fileName}`;
		}
		// (apiKey, voiceID, fileName, textInput, stability, similarityBoost, modelId)
		await ElevenLabs.textToSpeech(
			API_KEY,
			voiceId,
			filePath,
			text,
			voiceStability,
			voiceSimilarityBoost
		);
		return `/tts/${type}/${fileName}`;
	} catch (error) {
		console.error('Error in converting text to speech:', error);
		throw error;
	}
};

function sayTTSExport(text: string, voiceName: string, filePath: string) {
	return new Promise((resolve, reject) => {
		say.export(text, voiceName, 1, filePath, (err) => {
			if (err) reject(err);
			resolve(filePath);
		});
	});
}

(async () => {
	voices = (await getVoices()) || [];
})();
