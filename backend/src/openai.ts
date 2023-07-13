import OpenAI from 'openai';
import fs from 'fs';
import axios from 'axios';
import {
	beginStreamMessage,
	endStreamMessage,
	streamMessageChunk,
} from './ws.js';

type Message =
	OpenAI.Chat.CompletionCreateParams.CreateChatCompletionRequestStreaming.Message;
type Response = OpenAI.Chat.Completions.ChatCompletion;

const MAX_TOKENS = 1000;

import path from 'path';
import { __dirname } from './const.js';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../../../../.env') });
const openAIApi = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY as string,
});

let oobaApi: OpenAI | null = null;
if (process.env.OOBABOOGA_API_URL) {
	oobaApi = new OpenAI({
		apiKey: 'sk-1111',
		baseURL: process.env.OOBABOOGA_API_URL,
	});
}

export default openAIApi;

export async function sendMessage(
	systemPrompt: string,
	history: Message[],
	userMessage: string,
	model = 'gpt-3.5-turbo',
	threadId: string,
	messageId: string
): Promise<Response> {
	let api: OpenAI;
	if (!model || model.startsWith('ooba-')) {
		if (!oobaApi) throw new Error('OOBA API is not configured');
		api = oobaApi;
	} else {
		api = openAIApi;
	}
	const stream = await sendAPIMessage(
		systemPrompt,
		history,
		userMessage,
		model,
		api
	);
	let responseText = '';
	beginStreamMessage(threadId, messageId);
	for await (const chunk of stream) {
		if (chunk.choices) {
			responseText += chunk.choices[0].delta?.content;
			streamMessageChunk(messageId, chunk.choices[0].delta?.content || '');
		}
	}
	endStreamMessage(messageId);
	return {
		id: '',
		object: 'chat.completion',
		created: 0,
		model: '',
		choices: [
			{
				index: 0,
				message: {
					role: 'assistant',
					content: responseText || 'Error: No response from AI.',
				},
			},
		],
		usage: {
			prompt_tokens: 0,
			completion_tokens: 0,
			total_tokens: 0,
		},
	};
}

async function sendAPIMessage(
	systemPrompt: string,
	history: Message[],
	userMessage: string,
	model: string,
	api: OpenAI
) {
	return await api.chat.completions.create({
		model,
		messages: [
			{
				role: 'system',
				content: systemPrompt,
			},
			...history,
			{
				role: 'user',
				content: userMessage,
			},
		],
		max_tokens: MAX_TOKENS,
		stream: true,
	});
}

export async function getTranscription(audioFile: string) {
	const response = await openAIApi.audio.transcriptions.create({
		file: fs.createReadStream(audioFile) as any,
		model: 'whisper-1',
	});
	return response;
}

export async function getOobaModels() {
	const OOBA_API_URL = process.env.OOBABOOGA_API_URL;
	if (!OOBA_API_URL) return [];
	const url = OOBA_API_URL + '/v1/models';
	try {
		// simply check if the url loads
		const res = await axios.get(url);
		if (!res || !res.data) return [];
		return ['ooba-booga'];
	} catch (err) {
		console.log(err);
		return [];
	}
}

// Oobabooga
// default api:
// POST /api/v1/generate for one-off messages
// (takes a body.prompt and body.params)
// POST /api/v1/chat
// (takes a body.user_input and body.history)
