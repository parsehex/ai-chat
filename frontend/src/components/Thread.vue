<template>
	<div>
		<h2>Thread {{ thread?.name }}</h2>
		<button v-if="thread" @click="clearHistory">Clear History</button>
		<div class="system-prompt">
			<label for="systemPrompt">System prompt:</label>
			<input id="systemPrompt" v-model="systemPrompt" type="text" />
			<button @click="updateSystemPrompt">Update System Prompt</button>
		</div>
		<div ref="messageContainer" class="message-container">
			<div v-if="!thread">No thread selected</div>
			<div v-if="thread" v-for="message in thread.messages" :key="message.id">
				<div v-if="!isEditing(message.id)">
					{{ message.role }}: {{ message.content }}
					<button @click="startEditing(message.id)">Edit</button>
					<button @click="deleteMessage(message.id)">Delete</button>
				</div>
				<div v-else class="flex">
					<input class="flex-grow" v-model="message.content" />
					<button @click="updateMessage(message.id, message.content)">
						Update
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useThreadStore } from '@/stores/threads';

const threadStore = useThreadStore();
const messageContainer = ref(null as HTMLDivElement | null);
const systemPrompt = ref('');
const editingMessageId = ref('');

const threadId = computed(() => threadStore.$state.currentThreadId);
const thread = computed(() => {
	const currentThreadId = threadStore.$state.currentThreadId;
	return (
		threadStore.$state.threads.find(
			(thread) => thread.id === currentThreadId
		) || null
	);
});

watchEffect(() => {
	if (threadId.value) {
		getThread(threadId.value);
	}
});

watchEffect(
	() => {
		console.log('thread changed');
		if (thread.value?.messages && messageContainer.value) {
			scrollToBottom();
		}
	},
	{ flush: 'post' }
);

watchEffect(() => {
	if (thread.value?.systemPrompt) {
		systemPrompt.value = thread.value.systemPrompt;
	}
});

async function updateSystemPrompt() {
	if (threadId.value) {
		await threadStore.updateSystemPrompt(threadId.value, systemPrompt.value);
	}
}

async function getThread(id: string) {
	await threadStore.fetchThread(id);
}

function scrollToBottom() {
	const lastMessage = messageContainer.value?.lastElementChild;
	if (lastMessage) {
		lastMessage.scrollIntoView();
	}
}

async function clearHistory() {
	if (threadId.value) {
		await threadStore.clearThreadHistory(threadId.value);
	}
}

async function updateMessage(id: string, content: string) {
	const message = thread.value?.messages.find((message) => message.id === id);
	if (message) {
		await threadStore.updateMessage(threadId.value, id, content);
		stopEditing();
	}
}

async function deleteMessage(id: string) {
	await threadStore.deleteMessageFromThread({
		threadId: threadId.value,
		messageId: id,
	});
}

// A method to start editing a message
function startEditing(messageId: string) {
	editingMessageId.value = messageId;
}

// A method to stop editing a message
function stopEditing() {
	editingMessageId.value = '';
}

// A method to check if a message is being edited
function isEditing(messageId: string) {
	return editingMessageId.value === messageId;
}
</script>

<style scoped>
.system-prompt {
	display: flex;
}

input {
	flex-grow: 1;
}
</style>
