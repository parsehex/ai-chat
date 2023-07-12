import path from 'path';
import url from 'url';

const __dirname = path.resolve(
	url.fileURLToPath(new URL(import.meta.url)),
	'..'
);

import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../../../../.env') });

import axios from 'axios';
import fs from 'fs-extra';
import FormData from 'form-data';

const openaiKey = process.env.OPENAI_API_KEY;
const mp3 = path.join(__dirname, '../audio.mp3');

// curl --request POST \
//   --url https://api.openai.com/v1/audio/transcriptions \
//   --header 'Authorization: Bearer TOKEN' \
//   --header 'Content-Type: multipart/form-data' \
//   --form file=@/path/to/file/openai.mp3 \
//   --form model=whisper-1

const openai = axios.create({
	baseURL: 'https://api.openai.com/v1',
	headers: {
		Authorization: `Bearer ${openaiKey}`,
		'Content-Type': 'multipart/form-data',
	},
});

(async () => {
	// read file
	const formData = new FormData();
	// formData.append('file', await fs.readFile(mp3));
	const audioStream = fs.createReadStream(mp3);
	formData.append('file', audioStream, {
		filename: 'audio.webm',
		contentType: 'audio/webm',
	});
	formData.append('model', 'whisper-1');

	const res = await openai.post('/audio/transcriptions', formData);
	const { data } = res;
	// write to file
	await fs.writeFile(
		path.join(__dirname, '../openai-whisper.json'),
		JSON.stringify(data, null, 2)
	);
	console.log('openai-whisper.json created');
})();
