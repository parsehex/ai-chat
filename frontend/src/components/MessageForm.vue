<template>
	<form v-if="threadId" @submit.prevent="sendMessage">
		<input v-model="message" type="text" />
		<button type="submit">Send</button>
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
		const newMessage: Message = JSON.parse(JSON.stringify({
			role: 'user',
			content: message.value
		}));
		message.value = '';
		threadStore.addMessageToThread({ threadId: threadId.value, message: newMessage });
		const updatedThread = await axios.post('/api/chat', { message: newMessage.content, id: threadId.value });
		if (updatedThread.data) {
			threadStore.setThread(updatedThread.data);
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
</style>
