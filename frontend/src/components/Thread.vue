<template>
	<div class="flex flex-col h-full">
		<div class="sticky bg-gray-700 top-0 z-10 p-2">
			<h2>{{ thread?.name }}</h2>
			<button class="btn-err" v-if="thread" @click="clearHistory">
				Clear History
			</button>
			<form @submit.prevent="updateSystemPrompt" class="flex">
				<label class="flex-grow flex">
					<span class="mr-1">System prompt:</span>
					<input class="flex-grow" v-model="systemPrompt" type="text" />
				</label>
				<button class="btn" @click="updateSystemPrompt">Update</button>
			</form>
		</div>
		<div
			ref="messageContainer"
			class="message-container overflow-auto flex-grow"
		>
			<div v-if="!thread">No thread selected</div>
			<div
				v-if="thread"
				class="hover:bg-gray-400 hover:text-gray-800 transition-colors duration-200 p-1"
				v-for="message in thread.messages"
				:key="message.id"
			>
				<div
					v-if="!isEditing(message.id)"
					class="flex items-center justify-between"
				>
					{{ message.role }}: {{ message.content }}
					<span>
						<AudioPlayer v-if="message.tts" :ttsUrl="`/tts/${message.tts}`" />
						<button
							class="btn"
							@click="startEditing(message.id)"
							title="Edit message"
						>
							<font-awesome-icon icon="pen-to-square" />
						</button>
						<button
							class="btn-err"
							@click="deleteMessage(message.id)"
							title="Delete message"
						>
							<font-awesome-icon icon="trash" />
						</button>
					</span>
				</div>
				<form
					v-else
					@submit.prevent="updateMessage(message.id, message.content)"
					class="flex"
				>
					<!-- editing message -->
					<input class="flex-grow" v-model="message.content" />
					<button
						class="btn"
						@click="updateMessage(message.id, message.content)"
					>
						Update
					</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useThreadStore } from '@/stores/threads';
import AudioPlayer from './AudioPlayer.vue';

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
	if (
		threadId.value &&
		systemPrompt.value &&
		systemPrompt.value !== thread.value?.systemPrompt
	) {
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
