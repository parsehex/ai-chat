import {
	Configuration,
	OpenAIApi,
	ChatCompletionRequestMessage,
	CreateChatCompletionResponse,
} from 'openai';
import fs from 'fs';
import axios from 'axios';

const MAX_TOKENS = 1000;

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY as string,
});
const openai = new OpenAIApi(configuration);

export default openai;

export async function sendMessage(
	systemPrompt: string,
	history: ChatCompletionRequestMessage[],
	userMessage: string,
	model = 'gpt-3.5-turbo'
): Promise<CreateChatCompletionResponse> {
	if (model.startsWith('ooba-')) {
		return sendOobaMessage(systemPrompt, history, userMessage);
	} else {
		return sendOpenAIMessage(systemPrompt, history, userMessage, model);
	}
}

async function sendOpenAIMessage(
	systemPrompt: string,
	history: ChatCompletionRequestMessage[],
	userMessage: string,
	model: string
): Promise<CreateChatCompletionResponse> {
	if (!model || !process.env.OPENAI_API_KEY || model.startsWith('ooba-')) {
		throw new Error("Won't send a local message to OpenAI.");
	}
	const chatResponse = await openai.createChatCompletion({
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
	});
	return chatResponse.data;
}

export async function getTranscription(audioFile: string) {
	const response = await openai.createTranscription(
		fs.createReadStream(audioFile) as any,
		'whisper-1'
	);
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

// default api:
// POST /api/v1/generate for one-off messages
// (takes a body.prompt and body.params)
// POST /api/v1/chat
// (takes a body.user_input and body.history)

export async function sendOobaMessage(
	systemPrompt: string,
	history: ChatCompletionRequestMessage[],
	userMessage: string
): Promise<CreateChatCompletionResponse> {
	const OOBA_API_URL = process.env.OOBABOOGA_API_URL;
	if (!OOBA_API_URL) throw new Error('OOBA_API_URL is not set');
	const url = OOBA_API_URL + '/v1/chat/completions';
	const body = {
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
	};
	const res = await axios.post(url, body);
	const data = res.data;
	return data;
}
