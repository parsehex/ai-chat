import dotenv from 'dotenv';
dotenv.config();
import { getVoice, getVoices, textToSpeech } from 'elevenlabs-node';

const apiKey = process.env.ELEVENLABS_API_KEY;

(async () => {
	const fileName = 'audio.mp3';
	const textInput = 'mozzy is cool';

	const voices = (await getVoices(apiKey)).voices;
	// pick random voice
	const voice = voices[Math.floor(Math.random() * voices.length)];

	textToSpeech(apiKey, voice.voice_id, fileName, textInput).then((res) => {
		console.log('Used voice: ' + voice.voice_id, 'Name: ' + voice.name);
		// console.log(res); // { status: 'ok' }
	});
})();
