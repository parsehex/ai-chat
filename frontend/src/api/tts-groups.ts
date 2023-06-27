import type { Voice } from '@shared/typesElevenLabs';
import type { ChatModel, TTSGroup, Thread } from '@shared/types';
import axios from 'axios';

export async function getGroups(): Promise<TTSGroup[]> {
	const response = await axios.get('/api/tts-groups');
	return response.data;
}

export async function getGroupById(groupId: string): Promise<TTSGroup> {
	const response = await axios.get(`/api/tts-groups/${groupId}`);
	return response.data;
}

export async function createGroup(name: string): Promise<TTSGroup> {
	const response = await axios.post('/api/tts-groups', { name });
	return response.data;
}

export async function deleteGroup(groupId: string): Promise<void> {
	await axios.delete(`/api/tts-groups/${groupId}`);
}

export async function clearGroupHistory(groupId: string): Promise<TTSGroup> {
	const response = await axios.post(`/api/tts-groups/${groupId}/clear`);
	return response.data;
}

interface UpdateGroupOptions {
	groupId: string;
	name?: string;
	defaultTTSVoiceId?: string;
	defaultTTSVoiceStability?: number;
	defaultTTSVoiceSimilarityBoost?: number;
}
export async function updateGroup(opt: UpdateGroupOptions): Promise<TTSGroup> {
	if (
		!opt.name &&
		!opt.defaultTTSVoiceId &&
		!opt.defaultTTSVoiceStability &&
		!opt.defaultTTSVoiceSimilarityBoost
	) {
		throw new Error('No options were provided');
	}
	const options: Record<string, unknown> = {};
	if (opt.name) options.name = opt.name;
	if (opt.defaultTTSVoiceId) options.defaultTTSVoiceId = opt.defaultTTSVoiceId;
	if (opt.defaultTTSVoiceStability)
		options.defaultTTSVoiceStability = opt.defaultTTSVoiceStability;
	if (opt.defaultTTSVoiceSimilarityBoost)
		options.defaultTTSVoiceSimilarityBoost = opt.defaultTTSVoiceSimilarityBoost;
	const response = await axios.patch(`/api/tts-groups/${opt.groupId}`, options);
	return response.data;
}

export async function addText(
	groupId: string,
	content: string,
	quiet = false,
	ttsVoiceId?: string,
	ttsVoiceStability?: number,
	ttsVoiceSimilarityBoost?: number
): Promise<TTSGroup> {
	const data: Record<string, unknown> = {
		id: groupId,
		text: content,
		quiet,
	};
	if (ttsVoiceId) data.voiceId = ttsVoiceId;
	if (ttsVoiceStability) data.voiceStability = ttsVoiceStability;
	if (ttsVoiceSimilarityBoost)
		data.voiceSimilarityBoost = ttsVoiceSimilarityBoost;
	const response = await axios.post(`/api/tts-groups/${groupId}/text`, data);
	return response.data;
}

export async function updateText(
	groupId: string,
	textId: string,
	text?: string,
	voiceId?: string,
	voiceStability?: number,
	voiceSimilarityBoost?: number
): Promise<TTSGroup> {
	const response = await axios.patch(
		`/api/tts-groups/${groupId}/text/${textId}`,
		{
			text,
			voiceId,
			voiceStability,
			voiceSimilarityBoost,
		}
	);
	return response.data;
}

export async function deleteTextFromGroup(
	groupId: string,
	textId: string
): Promise<TTSGroup> {
	const response = await axios.delete(
		`/api/tts-groups/${groupId}/text/${textId}`
	);
	return response.data;
}

export async function ttsFromText(
	groupId: string,
	textId: string
): Promise<TTSGroup> {
	const response = await axios.post(
		`/api/tts-groups/${groupId}/text/${textId}/tts`
	);
	return response.data;
}
