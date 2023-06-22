import type { Voice } from '@shared/typesElevenLabs';
import axios from 'axios';

export const getThreads = async () => {
	const response = await axios.get('/api/threads');
	return response.data;
};

export const getThreadById = async (threadId: string) => {
	const response = await axios.get(`/api/threads/${threadId}`);
	return response.data;
};

export const createThread = async (name: string) => {
	const response = await axios.post('/api/threads', { name });
	return response.data;
};

export const deleteThread = async (threadId: string) => {
	await axios.delete(`/api/threads/${threadId}`);
};

export const clearThreadHistory = async (threadId: string) => {
	const response = await axios.post(`/api/threads/${threadId}/clear`);
	return response.data;
};

export const updateSystemPrompt = async (
	threadId: string,
	newPrompt: string
) => {
	const response = await axios.patch(`/api/threads/${threadId}`, {
		systemPrompt: newPrompt,
	});
	return response.data;
};

export const updateMessage = async (
	threadId: string,
	messageId: string,
	content: string
) => {
	const response = await axios.patch(
		`/api/threads/${threadId}/messages/${messageId}`,
		{
			content,
		}
	);
	return response.data;
};

export const deleteMessageFromThread = async (
	threadId: string,
	messageId: string
) => {
	const response = await axios.delete(
		`/api/threads/${threadId}/messages/${messageId}`
	);
	return response.data;
};

export const getTTSVoices = async () => {
	const response = await axios.get('/api/voices');
	return response.data.voices as Voice[];
};
