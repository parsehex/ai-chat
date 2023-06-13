import fs from 'fs-extra';
import path from 'path';
import { Router } from 'express';
import openai from '../openai.js';
import { THREADS_PATH } from '../const.js';

const router = Router();

router.route('/api/chat').post(async (req, res) => {
	const { message, id } = req.body;

	if (!id) {
		return res.status(400).json({ error: 'Thread id is required' });
	}

	try {
		const threadFilePath = path.join(THREADS_PATH, `${id}.json`);
		const threadData = JSON.parse(await fs.readFile(threadFilePath, 'utf-8'));

		const chatResponse = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: threadData.systemPrompt,
				},
				...threadData.messages,
				{
					role: 'user',
					content: message,
				},
			],
		});
		const responseObj = chatResponse.data.choices[0].message;

		if (!responseObj) {
			return res.status(500).json({ error: 'No response from AI' });
		}

		threadData.messages.push({ role: 'user', content: message });
		threadData.messages.push({
			role: 'assistant',
			content: responseObj.content,
		});

		await fs.writeFile(threadFilePath, JSON.stringify(threadData));

		res.json(threadData);
	} catch (err: any) {
		// console.log(err);
		res.status(500).json({ error: err.message });
	}
});

export default router;
