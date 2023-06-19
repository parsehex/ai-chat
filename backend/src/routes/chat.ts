import { Router } from 'express';
import fs from 'fs-extra';
import { type ChatCompletionRequestMessage } from 'openai';
import path from 'path';
import { v4 } from 'uuid';
import { Message, Thread } from '../../../shared/types.js';
import { THREADS_PATH } from '../const.js';
import { sendMessage } from '../openai.js';
import { convertTextToSpeech, getRandomVoice, getVoiceByName } from '../tts.js';
import { Voice } from '../../../shared/typesElevenLabs.js';

const router = Router();

router.route('/api/chat').post(async (req, res) => {
	const { message, id, useTTS } = req.body;

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
			} as ChatCompletionRequestMessage;
		});

		const chatResponse = await sendMessage(
			thread.systemPrompt,
			history,
			message
		);
		const responseObj = chatResponse.data.choices[0].message;

		if (!responseObj) {
			return res.status(500).json({ error: 'No response from AI' });
		}

		const userMessage: Message = { id: v4(), role: 'user', content: message };
		const aiMessage: Message = {
			id: v4(),
			role: 'assistant',
			content: responseObj.content,
		};
		thread.messages.push(userMessage);
		thread.messages.push(aiMessage);

		await fs.writeFile(threadFilePath, JSON.stringify(thread));

		if (useTTS) {
			const voice = (await getVoiceByName('Rachel')) as Voice;
			const ttsResponse = await convertTextToSpeech(
				voice.voice_id,
				responseObj.content
			);
			// console.log('Voice:', voice.name, 'TTS Response:', ttsResponse);

			aiMessage.tts = ttsResponse;
			await fs.writeFile(threadFilePath, JSON.stringify(thread));

			return res.json({
				thread,
				ttsResponse,
			});
		}

		res.json({ thread });
	} catch (err: any) {
		console.log(err);
		res.status(500).json({ error: err.message });
	}
});

export default router;
