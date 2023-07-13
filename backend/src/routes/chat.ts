import { Router } from 'express';
import fs from 'fs-extra';
// import {
// 	CreateChatCompletionResponse,
// 	type ChatCompletionRequestMessage,
// } from 'openai';
import path from 'path';
import { v4 } from 'uuid';
import { Voice } from '../../../shared/types/ElevenLabs.js';
import { Message, Thread } from '../../../shared/types/chat.js';
import { THREADS_PATH } from '../const.js';
import { getOobaModels, sendMessage } from '../openai.js';
import { convertTextToSpeech, getVoiceById, getVoices } from '../tts.js';

const router = Router();

router.get('/api/chat/models', async (req, res) => {
	try {
		const models = ['gpt-3.5-turbo', 'gpt-4'];
		const ooba = await getOobaModels();
		if (ooba.length > 0) models.push(...ooba);
		res.json({ models });
	} catch (err: any) {
		console.log(err);
		res.status(500).json({ error: err.message });
	}
});

router.post('/api/chat', async (req, res) => {
	const { message, id } = req.body;

	if (!id || !message) {
		return res
			.status(400)
			.json({ error: 'Thread id and a message is required' });
	}

	try {
		const threadFilePath = path.join(THREADS_PATH, `${id}.json`);
		const thread: Thread = JSON.parse(
			await fs.readFile(threadFilePath, 'utf-8')
		);

		const history = thread.messages.map((message) => {
			return {
				role: message.role,
				content: message.content,
			} as any; // TODO
		});

		const aiMessageId = v4();

		const chatResponse = await sendMessage(
			thread.systemPrompt,
			history,
			message,
			thread.chatModel,
			thread.id,
			aiMessageId
		);
		console.log(chatResponse);
		if (!chatResponse) {
			return res.status(500).json({ error: 'No response from AI' });
		}

		const responseObj = chatResponse.choices[0].message;

		if (!responseObj) {
			return res.status(500).json({ error: 'Invalid response from AI' });
		}

		const userMessage: Message = { id: v4(), role: 'user', content: message };
		const aiMessage: Message = {
			id: aiMessageId,
			role: 'assistant',
			content: responseObj.content as string,
		};
		thread.messages.push(userMessage);
		thread.messages.push(aiMessage);

		if (thread.ttsEnabled) {
			const voice = (await getVoiceById(thread.ttsVoiceId)) as Voice;
			const ttsResponse = await convertTextToSpeech(
				voice.voice_id,
				responseObj.content as string,
				'chat'
			);

			aiMessage.tts = ttsResponse;
		}
		await fs.writeFile(threadFilePath, JSON.stringify(thread));

		res.json({ thread });
	} catch (err: any) {
		console.log(err);
		res.status(500).json({ error: err.message });
	}
});

export default router;
