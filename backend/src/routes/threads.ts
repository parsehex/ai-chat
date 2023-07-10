import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { v4 } from 'uuid';
import { THREADS_PATH } from '../const.js';
import { sendMessage } from '../openai.js';
import { Thread } from '../../../shared/types/chat.js';
import { ChatCompletionRequestMessage } from 'openai';
import { voices } from '../tts.js';

const router = Router();

router.get('/api/threads', async (req, res) => {
	// get threads
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
	// create thread
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
	// get thread
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
	// delete thread
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
	// update thread
	try {
		const threadId = req.params.threadId;
		const { name, systemPrompt, ttsEnabled, ttsVoiceId, chatModel } = req.body;

		if (!name && !systemPrompt && !ttsEnabled && !ttsVoiceId && !chatModel) {
			return res.status(400).json({ error: 'No data to update' });
		}

		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		const thread: Thread = JSON.parse(
			await fs.readFile(threadFilePath, 'utf-8')
		);

		const threadData = {
			...thread,
		};
		if (name) thread.name = name;
		if (systemPrompt) thread.systemPrompt = systemPrompt;
		if (ttsEnabled) thread.ttsEnabled = ttsEnabled;
		if (ttsVoiceId) thread.ttsVoiceId = ttsVoiceId;
		else if (ttsEnabled && !thread.ttsVoiceId)
			thread.ttsVoiceId = voices[0].voice_id;
		if (chatModel) thread.chatModel = chatModel;

		await fs.writeFile(threadFilePath, JSON.stringify(thread));

		res.json(thread);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.post('/api/threads/:threadId/clear', async (req, res) => {
	// clear thread messages
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

router.post('/api/threads/:threadId/messages/:messageId', async (req, res) => {
	// re-send message
	try {
		const threadId = req.params.threadId;
		const messageId = req.params.messageId;
		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		let thread: Thread = JSON.parse(await fs.readFile(threadFilePath, 'utf-8'));

		const message = thread.messages.find((message) => message.id === messageId);

		if (!message) {
			return res.status(404).json({ error: 'Message not found' });
		}
		if (message.role === 'user') {
			return res.status(400).json({ error: 'Cannot re-send user message' });
		}

		const history = thread.messages.map((message) => {
			return {
				role: message.role,
				content: message.content,
			} as ChatCompletionRequestMessage;
		});
		// get all messages before the message to be re-sent
		const tmpHistory: ChatCompletionRequestMessage[] = [];
		let userMessage = '';
		for (let i = 0; i < history.length; i++) {
			const msg = thread.messages[i];
			if (msg.id === messageId) {
				userMessage = history[i - 1].content;
				break;
			}
			tmpHistory.push(history[i]);
		}

		if (!userMessage) {
			return res.status(404).json({ error: 'Message not found' });
		}

		const chatResponse = await sendMessage(
			thread.systemPrompt,
			tmpHistory,
			userMessage,
			thread.chatModel
		);

		if (!chatResponse.choices[0].message) {
			return res.status(500).json({ error: 'No response from AI' });
		}

		message.content = chatResponse.choices[0].message.content;
		if (message.tts) delete message.tts;

		await fs.writeFile(threadFilePath, JSON.stringify(thread));

		res.json(thread);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.delete(
	'/api/threads/:threadId/messages/:messageId',
	async (req, res) => {
		// delete message
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
	// edit message
	try {
		const { threadId, messageId } = req.params;
		const { content } = req.body; // The new content for the message

		if (!content) {
			return res.status(400).json({ error: 'Message content is required' });
		}

		const threadFilePath = path.join(THREADS_PATH, `${threadId}.json`);
		let threadData = JSON.parse(await fs.readFile(threadFilePath, 'utf-8'));

		const messageIndex = threadData.messages.findIndex(
			(message) => message.id === messageId
		);

		if (messageIndex === -1) {
			return res.status(404).json({ error: 'Message not found' });
		}

		threadData.messages[messageIndex].content = content;

		await fs.writeFile(threadFilePath, JSON.stringify(threadData));

		res.json(threadData);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
