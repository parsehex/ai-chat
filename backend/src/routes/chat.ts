import { Router } from 'express';
import fs from 'fs-extra';
import { type ChatCompletionRequestMessage } from 'openai';
import path from 'path';
import { v4 } from 'uuid';
import { Thread } from '../../../shared/types.js';
import { THREADS_PATH } from '../const.js';
import { sendMessage } from '../openai.js';
import { convertTextToSpeech, getRandomVoice } from '../tts.js';

const router = Router();

router.route('/api/chat').post(async (req, res) => {
	const { message, id, useTTS } = req.body;

	if (!id) {
		return res.status(400).json({ error: 'Thread id is required' });
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

		thread.messages.push({ id: v4(), role: 'user', content: message });
		thread.messages.push({
			id: v4(),
			role: 'assistant',
			content: responseObj.content,
		});

		await fs.writeFile(threadFilePath, JSON.stringify(thread));

		if (useTTS) {
			const voice = await getRandomVoice();
			const ttsResponse = await convertTextToSpeech(
				voice.voice_id,
				responseObj.content
			);
			// console.log('Voice:', voice.name, 'TTS Response:', ttsResponse);

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
