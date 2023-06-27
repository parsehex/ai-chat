import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai';
import fs from 'fs';

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
) {
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
		max_tokens: 1000,
	});
	return chatResponse;
}

export async function getTranscription(audioFile: string) {
	const response = await openai.createTranscription(
		fs.createReadStream(audioFile) as any,
		'whisper-1'
	);
	return response;
}
