import { defineStore } from 'pinia';
import { type Message, type Thread } from '@shared/types';
import * as api from '../api';

export const useThreadStore = defineStore({
	id: 'thread',
	state: () => ({
		threads: [] as Thread[],
		currentThreadId: '',
		apiCallInProgress: false,
		ttsVoiceId: null as string | null,
	}),
	actions: {
		setTTSVoiceId(voiceId: string | null) {
			this.ttsVoiceId = voiceId;
			localStorage.setItem('ttsVoiceId', voiceId || '');
		},
		setCurrentThread(threadId: string) {
			this.currentThreadId = threadId;
			localStorage.setItem('selectedThread', threadId);
		},
		setThreads(threads: Thread[]) {
			this.threads = threads;
		},
		setThread(threadArg: Thread | string) {
			let thread = threadArg as Thread;
			if (typeof threadArg === 'string') {
				thread = this.getThread(threadArg) as Thread;
				if (!thread) return;
			}
			const threadIndex = this.threads.findIndex((t) => t.id === thread.id);
			if (threadIndex !== -1) {
				this.threads[threadIndex] = thread;
			}
		},
		getThread(threadId: string) {
			return this.threads.find((t) => t.id === threadId);
		},
		addMessageToThread({
			threadId,
			message,
		}: {
			threadId: string;
			message: Message;
		}) {
			const thread = this.getThread(threadId);
			if (thread) {
				thread.messages.push(message);
			}
		},
		async fetchThreads() {
			try {
				this.threads = await api.getThreads();
			} catch (error: any) {
				console.error('Failed to fetch threads:', error);
			}
		},
		async fetchThread(threadId: string) {
			try {
				this.setThread(await api.getThreadById(threadId));
			} catch (error: any) {
				console.error('Failed to fetch thread:', error);
			}
		},
		async createThread({ name }: { name: string }) {
			try {
				const thread = await api.createThread(name);
				this.threads.push(thread);
				this.setCurrentThread(thread.id);
			} catch (error: any) {
				console.error('Failed to create thread:', error);
			}
		},
		async deleteThread(threadId: string) {
			try {
				await api.deleteThread(threadId);
				await this.fetchThreads();
				if (this.currentThreadId === threadId) {
					this.currentThreadId = '';
				}
			} catch (error) {
				console.error('Failed to delete thread:', error);
			}
		},
		async clearThreadHistory(threadId: string) {
			try {
				this.setThread(await api.clearThreadHistory(threadId));
			} catch (error) {
				console.error('Failed to clear thread history:', error);
			}
		},
		async updateSystemPrompt(threadId: string, newPrompt: string) {
			try {
				this.setThread(await api.updateSystemPrompt(threadId, newPrompt));
			} catch (error) {
				console.error('Failed to update system prompt:', error);
			}
		},
		async updateMessage(threadId: string, messageId: string, content: string) {
			try {
				this.setThread(await api.updateMessage(threadId, messageId, content));
			} catch (error) {
				console.error('Failed to update message:', error);
			}
		},
		async deleteMessageFromThread({
			threadId,
			messageId,
		}: {
			threadId: string;
			messageId: string;
		}) {
			try {
				this.setThread(await api.deleteMessageFromThread(threadId, messageId));
			} catch (error: any) {
				console.error('Failed to delete message from thread:', error);
			}
		},
		async generateTTSFromMessage(threadId: string, messageId: string) {
			if (!this.ttsVoiceId) return;
			try {
				const thread = await api.ttsFromMessage(
					threadId,
					messageId,
					this.ttsVoiceId
				);
				this.setThread(thread);
			} catch (error: any) {
				console.error('Failed to generate TTS from message:', error);
			}
		},
	},
});
