<template>
	<form v-if="threadId" @submit.prevent="sendMessage">
		<input v-model="message" type="text" />
		<button type="submit">Send</button>
		<div v-if="threadStore.apiCallInProgress" class="spinner"></div>
	</form>
</template>


<script setup lang="ts">
import { computed, ref } from 'vue';
import axios from 'axios';
import { useThreadStore } from '@/stores/threads';
import type { Message } from '@shared/types';

const threadStore = useThreadStore();
const threadId = computed(() => threadStore.$state.currentThreadId)
const message = ref('');

const sendMessage = async () => {
	if (message.value) {
		threadStore.apiCallInProgress = true;
		const newMessage: Message = JSON.parse(JSON.stringify({
			role: 'user',
			content: message.value
		}));
		message.value = '';
		threadStore.addMessageToThread({ threadId: threadId.value, message: newMessage });
		try {
			const updatedThread = await axios.post('/api/chat', { message: newMessage.content, id: threadId.value });
			if (updatedThread.data) {
				threadStore.setThread(updatedThread.data);
			}
		} catch (error: any) {
			console.error('Failed to send message:', error);
		} finally {
			threadStore.apiCallInProgress = false;
		}
	}
};


</script>

<style scoped>
form {
	display: flex;
}

input {
	flex-grow: 1;
}

.spinner {
	border: 4px solid #f3f3f3;
	border-radius: 50%;
	border-top: 4px solid #3498db;
	width: 12px;
	height: 12px;
	animation: spin 2s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}
</style>
