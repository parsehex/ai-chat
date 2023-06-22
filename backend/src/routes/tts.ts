import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { Thread } from '../../../shared/types.js';
import { THREADS_PATH } from '../const.js';
import { convertTextToSpeech } from '../tts.js';

const router = Router();

router.post('/api/tts', async (req, res) => {
	const { voice_id, text } = req.body;

	if (!voice_id || !text) {
		return res.status(400).json({ error: 'Voice id and text is required' });
	}

	try {
		const ttsResponse = await convertTextToSpeech(voice_id, text, 'tts');

		return res.status(200).json({ tts: ttsResponse });
	} catch (error) {
		console.error('Error in converting text to speech:', error);
		return res
			.status(500)
			.json({ error: 'Error in converting text to speech' });
	}
});

router.post('/api/tts/chat/:threadId/:messageId', async (req, res) => {
	const { threadId, messageId } = req.params;
	const { voice_id } = req.body;

	if (!threadId || !messageId) {
		return res
			.status(400)
			.json({ error: 'Thread id and message id is required' });
	}

	try {
		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		const thread: Thread = JSON.parse(
			await fs.readFile(threadFilePath, 'utf-8')
		);

		const message = thread.messages.find((message) => message.id === messageId);
		if (!message) {
			return res.status(400).json({ error: 'Message not found' });
		}

		// generate tts from message
		const tts = await convertTextToSpeech(voice_id, message.content, 'chat');
		message.tts = tts;

		await fs.writeFile(threadFilePath, JSON.stringify(thread));

		return res.status(200).json({ thread });
	} catch (error) {
		console.error('Error in getting tts from message:', error);
		return res
			.status(500)
			.json({ error: 'Error in generating tts from message' });
	}
});

export default router;
