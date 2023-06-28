import { defineStore } from 'pinia';
import { type ChatModel } from '@shared/types/chat';
import type { UserSubscription, Voice } from '@shared/types/ElevenLabs';
import * as api from '@/api';

const ONE_HOUR = 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR * 24;

export const useCacheStore = defineStore({
	id: 'cache',
	state: () => ({
		ttsVoices: [] as Voice[],
		chatModels: [] as ChatModel[],
		elevenlabsLimit: null as UserSubscription | null,
		lastFetch: {
			ttsVoices: 0,
			chatModels: 0,
			elevenlabsLimit: 0,
		},
	}),
	actions: {
		async fetchTTSVoices() {
			if (
				this.lastFetch.ttsVoices !== 0 &&
				Date.now() - this.lastFetch.ttsVoices < ONE_DAY
			)
				return;
			try {
				this.ttsVoices = await api.getTTSVoices();
				this.lastFetch.ttsVoices = Date.now();
			} catch (error: any) {
				console.error('Failed to fetch TTS voices:', error);
			}
		},
		async fetchChatModels() {
			if (
				this.lastFetch.chatModels !== 0 &&
				Date.now() - this.lastFetch.chatModels < ONE_DAY
			)
				return;
			try {
				this.chatModels = await api.getChatModels();
				this.lastFetch.chatModels = Date.now();
			} catch (error: any) {
				console.error('Failed to fetch chat models:', error);
			}
		},
		async fetchElevenlabsLimit() {
			try {
				this.elevenlabsLimit = await api.getElevenLabsLimits();
				this.lastFetch.elevenlabsLimit = Date.now();
			} catch (error: any) {
				console.error('Failed to fetch ElevenLabs limit:', error);
			}
		},
	},
});
