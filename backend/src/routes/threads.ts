import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { THREADS_PATH } from '../const.js';
import { v4 } from 'uuid';

const router = Router();

router.get('/api/threads', async (req, res) => {
	try {
		const fileNames = await fs.readdir(THREADS_PATH);
		const threads = await Promise.all(
			fileNames.map(async (fileName) => {
				const filePath = path.join(THREADS_PATH, fileName);
				const fileContent = await fs.readFile(filePath, 'utf-8');
				return JSON.parse(fileContent);
			})
		);
		res.json(threads);
	} catch (err: any) {
		console.log(err.message);
		res.status(500).json({ error: err.message });
	}
});
router.post('/api/threads', async (req, res) => {
	const { name, systemPrompt = 'You are a chatbot.' } = req.body;
	if (!name) {
		return res.status(400).json({ error: 'Thread name is required' });
	}

	try {
		const id = v4();
		const filePath = path.join(THREADS_PATH, `${id}.json`);

		const threadData = {
			id,
			systemPrompt,
			name,
			messages: [],
		};
		console.log(threadData);

		await fs.writeFile(filePath, JSON.stringify(threadData));
		res.status(201).json({ message: 'Thread created', id, name });
	} catch (err: any) {
		// console.log(err);
		res.status(500).json({ error: err.message });
	}
});

router.get('/api/threads/:threadId', async (req, res) => {
	try {
		const threadId = req.params.threadId;
		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		const threadData = JSON.parse(await fs.readFile(threadFilePath, 'utf-8'));
		res.json(threadData);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});
router.delete('/api/threads/:threadId', async (req, res) => {
	try {
		const threadId = req.params.threadId;
		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		await fs.remove(threadFilePath);
		res.json({ message: 'Thread deleted' });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});
router.patch('/api/threads/:threadId', async (req, res) => {
	try {
		const threadId = req.params.threadId;
		const { systemPrompt, ttsEnabled, ttsVoiceId, chatModel } = req.body;

		if (!systemPrompt && !ttsEnabled && !ttsVoiceId && !chatModel) {
			return res.status(400).json({ error: 'No data to update' });
		}

		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		let threadData = JSON.parse(await fs.readFile(threadFilePath, 'utf-8'));

		threadData = {
			...threadData,
			systemPrompt,
			ttsEnabled,
			ttsVoiceId,
			chatModel,
		};

		await fs.writeFile(threadFilePath, JSON.stringify(threadData));

		res.json(threadData);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.post('/api/threads/:threadId/clear', async (req, res) => {
	try {
		const threadId = req.params.threadId;
		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		let threadData = JSON.parse(await fs.readFile(threadFilePath, 'utf-8'));

		// Clear messages but keep the system prompt
		threadData = {
			...threadData,
			messages: [],
		};

		await fs.writeFile(threadFilePath, JSON.stringify(threadData));

		res.json(threadData);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.delete(
	'/api/threads/:threadId/messages/:messageId',
	async (req, res) => {
		try {
			const threadId = req.params.threadId;
			const messageId = req.params.messageId;
			const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
			let threadData = JSON.parse(await fs.readFile(threadFilePath, 'utf-8'));

			threadData.messages = threadData.messages.filter(
				(message) => message.id !== messageId
			);

			await fs.writeFile(threadFilePath, JSON.stringify(threadData));

			res.json(threadData);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);
router.patch('/api/threads/:threadId/messages/:messageId', async (req, res) => {
	try {
		const { threadId, messageId } = req.params;
		const { content } = req.body; // The new content for the message

		if (!content) {
			return res.status(400).json({ error: 'Message content is required' });
		}

		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		let threadData = JSON.parse(await fs.readFile(threadFilePath, 'utf-8'));

		// Find the message to edit
		const messageIndex = threadData.messages.findIndex(
			(message) => message.id === messageId
		);

		if (messageIndex === -1) {
			return res.status(404).json({ error: 'Message not found' });
		}

		// Edit the message
		threadData.messages[messageIndex].content = content;

		await fs.writeFile(threadFilePath, JSON.stringify(threadData));

		res.json(threadData);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
