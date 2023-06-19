import dotenv from 'dotenv';
dotenv.config();
import {
	getVoiceSettings,
	getVoice,
	getVoices,
	textToSpeech,
} from 'elevenlabs-node';

const apiKey = process.env.ELEVENLABS_API_KEY;

(async () => {
	const fileName = 'audio.mp3';
	const textInput = 'mozzy is cool';

	const voices = (await getVoices(apiKey)).voices;
	const voiceNames = voices.map((voice) => voice.name);
	const voice = voices.find((voice) => voice.name === 'Rachel');

	// console.log('Available voices: ' + voiceNames.join(', '));
	// Rachel, Domi, Bella, Antoni, Elli, Josh, Arnold, Adam, Sam

	console.log(await getVoiceSettings(apiKey, voice.voice_id));
	return;
	// pick random voice
	// const voice = voices[Math.floor(Math.random() * voices.length)];

	textToSpeech(apiKey, voice.voice_id, fileName, textInput).then((res) => {
		console.log('Used voice: ' + voice.voice_id, 'Name: ' + voice.name);
		// console.log(res); // { status: 'ok' }
	});
})();
