import path from 'path';
import url from 'url';

const __dirname = path.resolve(
	url.fileURLToPath(new URL(import.meta.url)),
	'..'
);

console.log(path.resolve(__dirname, '../../.env'));

import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../../.env') });

import OpenAI from 'openai'; // using new import (no config)

const openAI = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || 'sk-111111',
	// For Oobabooga, use the `openai` extension instead of `api`
	//  to work with the openai package out of the box.
	//  baseURL: 'http://localhost:5001/v1',
	// For GPT4All, go to settings -> Application
	//  and check Enable API Server
	//  baseURL: 'http://localhost:4891/v1',
	//  (Can't get to work; use Ooba)
});

(async () => {
	const stream = await openAI.chat.completions.create({
		model: 'gpt-3.5-turbo',
		messages: [{ role: 'user', content: 'Hello!' }],
		stream: false,
	});
	// for await (const part of stream) {
	// 	console.log(part.choices[0].delta);
	// }
	console.log(stream);
})();
