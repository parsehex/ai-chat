import { defineStore } from 'pinia';
import { type Message, type Thread } from '@shared/types';
import axios from 'axios';
import { onMounted } from 'vue';

export const useThreadStore = defineStore({
	id: 'thread',
	state: () => ({
		threads: [] as Thread[],
		currentThreadId: '',
	}),
	actions: {
		setThreads(threads: Thread[]) {
			this.threads = threads;
		},
		setThread(thread: Thread) {
			const threadIndex = this.threads.findIndex(t => t.id === thread.id);
			if (threadIndex !== -1) {
				this.threads[threadIndex] = thread;
			}
		},
		setCurrentThread(threadId: string) {
			this.currentThreadId = threadId;
		},
		addMessageToThread({ threadId, message }: { threadId: string, message: Message }) {
			const threadIndex = this.threads.findIndex(t => t.id === threadId);
			if (threadIndex !== -1) {
				this.threads[threadIndex].messages.push(message);
			}
		},
		async fetchThreads() {
			const response = await axios.get('/api/threads');
			this.threads = response.data;
		},
		async fetchThread(threadId: string) {
			const response = await axios.get(`/api/threads/${threadId}`);
			const threadIndex = this.threads.findIndex(t => t.id === threadId);
			if (threadIndex !== -1) {
				this.threads[threadIndex] = response.data;
			}
		},
		async createThread({ name }: { name: string }) {
			const response = await axios.post('/api/threads', { name })
			this.threads.push(response.data)
		},
		async deleteThread(threadId: string) {
			try {
				await fetch(`/api/threads/${threadId}`, { method: 'DELETE' });
				this.fetchThreads(); // Update the thread list after deletion
				if (this.currentThreadId === threadId) {
					this.currentThreadId = '';
				}
			} catch (error) {
				console.error('Failed to delete thread:', error);
			}
		},
		async clearThreadHistory(threadId: string) {
			try {
				const response = await axios.post(`/api/threads/${threadId}/clear`);
				const threadIndex = this.threads.findIndex(t => t.id === threadId);
				if (threadIndex !== -1) {
					this.threads[threadIndex] = response.data;
				}
			} catch (error) {
				console.error('Failed to clear thread history:', error);
			}
		},
		async updateSystemPrompt(threadId: string, newPrompt: string) {
			try {
				const response = await axios.patch(`/api/threads/${threadId}`, { systemPrompt: newPrompt });
				const threadIndex = this.threads.findIndex(t => t.id === threadId);
				if (threadIndex !== -1) {
					this.threads[threadIndex] = response.data;
				}
			} catch (error) {
				console.error('Failed to update system prompt:', error);
			}
		},
	},
});
