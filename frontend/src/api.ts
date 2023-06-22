import type { Voice } from '@shared/typesElevenLabs';
import type { Thread } from '@shared/types';
import axios from 'axios';

export async function getThreads(): Promise<Thread[]> {
	const response = await axios.get('/api/threads');
	return response.data;
}

export async function getThreadById(threadId: string): Promise<Thread> {
	const response = await axios.get(`/api/threads/${threadId}`);
	return response.data;
}

export async function createThread(name: string): Promise<Thread> {
	const response = await axios.post('/api/threads', { name });
	return response.data;
}

export async function deleteThread(threadId: string): Promise<void> {
	await axios.delete(`/api/threads/${threadId}`);
}

export async function clearThreadHistory(threadId: string): Promise<Thread> {
	const response = await axios.post(`/api/threads/${threadId}/clear`);
	return response.data;
}

export async function updateSystemPrompt(
	threadId: string,
	newPrompt: string
): Promise<Thread> {
	const response = await axios.patch(`/api/threads/${threadId}`, {
		systemPrompt: newPrompt,
	});
	return response.data;
}

export async function sendMessage(
	threadId: string,
	content: string,
	ttsEnabled = false,
	voiceId?: string
): Promise<Thread> {
	const data: Record<string, unknown> = {
		id: threadId,
		message: content,
	};
	if (ttsEnabled && voiceId) {
		data['tts'] = true;
		data['voice_id'] = voiceId;
	}
	const response = await axios.post(`/api/chat`, data);
	return response.data.thread;
}

export async function updateMessage(
	threadId: string,
	messageId: string,
	content: string
): Promise<Thread> {
	const response = await axios.patch(
		`/api/threads/${threadId}/messages/${messageId}`,
		{
			content,
		}
	);
	return response.data;
}

export async function deleteMessageFromThread(
	threadId: string,
	messageId: string
): Promise<Thread> {
	const response = await axios.delete(
		`/api/threads/${threadId}/messages/${messageId}`
	);
	return response.data;
}

export async function getTranscription(
	audio: Blob
): Promise<{ transcription: string }> {
	const formData = new FormData();
	formData.append('audio', audio);
	const response = await axios.post('/api/transcription', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
}

export async function getTTSVoices(): Promise<Voice[]> {
	const response = await axios.get('/api/voices');
	return response.data.voices;
}

export async function convertTextToSpeech(
	voice_id: string,
	text: string
): Promise<string> {
	const response = await axios.post('/api/tts', { voice_id, text });
	return response.data.tts;
}

export async function ttsFromMessage(
	threadId: string,
	messageId: string,
	voice_id: string
): Promise<Thread> {
	const response = await axios.post(`/api/tts/chat/${threadId}/${messageId}`, {
		voice_id,
	});
	return response.data.thread;
}
