<template>
	<div class="flex-grow flex flex-col h-screen overflow-hidden">
		<div class="sticky bg-gray-700 top-0 z-10 p-2">
			<!-- header -->
			<h2 class="text-xl">
				{{ thread?.name }}
			</h2>
			<div class="flex">
				<button class="btn-err outline" v-if="thread" @click="clearHistory">
					Clear History
				</button>
				<ChatModelSelector class="ml-1" v-model="chatModel" />
				<label>
					Use TTS
					<input
						class="ml-1"
						type="checkbox"
						v-model="ttsEnabled"
						:disabled="!thread"
					/>
				</label>
				<TTSVoiceSelector
					class="ml-1"
					v-if="ttsEnabled"
					v-model="ttsVoiceId"
					:disabled="!thread"
				/>
			</div>
			<form @submit.prevent="updateSystemPrompt" class="flex">
				<label class="flex-grow flex">
					<span class="mr-1">System prompt:</span>
					<!-- <input
						class="flex-grow border-2 border-gray-300 rounded-md px-1"
						v-model="systemPrompt"
						type="text"
					/> -->
					<FlexibleTextInput
						class="flex-grow border-2 border-gray-300 rounded-md px-1"
						v-model="systemPrompt"
					/>
				</label>
				<button class="btn" @click="updateSystemPrompt">Update</button>
			</form>
		</div>
		<div ref="messageContainer" class="overflow-y-auto flex-grow">
			<!-- message history -->
			<div v-if="!thread">No thread selected</div>
			<div
				v-else
				class="hover:bg-gray-800 p-1"
				v-for="message in thread.messages"
				:key="message.id"
			>
				<div
					v-if="!isEditing(message.id)"
					class="flex items-center justify-between"
				>
					<div class="inline-flex flex-col">
						<span
							class="text-sm cursor-default select-none underline dark:text-gray-400"
							>{{ message.role }}</span
						>
						<span class="whitespace-pre-line">{{ message.content }}</span>
					</div>
					<div class="inline-flex">
						<AudioPlayer v-if="message.tts" :ttsUrl="message.tts" />
						<button
							v-else-if="message.role !== 'user'"
							class="btn"
							@click="generateTTS(message.id)"
							title="Generate TTS"
						>
							<font-awesome-icon icon="comment" />
						</button>
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
					</div>
				</div>
				<form
					v-else
					@submit.prevent="updateMessage(message.id, message.content)"
					class="flex"
				>
					<!-- editing message -->
					<!-- <input type="text" class="flex-grow" v-model="message.content" /> -->
					<FlexibleTextInput class="flex-grow" v-model="message.content" />
					<button
						class="btn"
						@click="updateMessage(message.id, message.content)"
					>
						Update
					</button>
				</form>
			</div>
		</div>
		<MessageForm />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useThreadStore } from '@/store/threads';
import AudioPlayer from '@/components/AudioPlayer.vue';
import FlexibleTextInput from '@/components/FlexibleTextInput.vue';
import MessageForm from '@/components/MessageForm.vue';
import ChatModelSelector from '@/components/ChatModelSelector.vue';
import TTSVoiceSelector from '@/components/TTSVoiceSelector.vue';

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

// ttsEnabled and ttsVoiceId come from the thread, when theyre updated then patch the thread
const ttsEnabled = computed({
	get: () => thread.value?.ttsEnabled || false,
	set: (value) => {
		if (threadId.value) {
			threadStore.updateThread(threadId.value, {
				systemPrompt: systemPrompt.value,
				chatModel: chatModel.value,
				ttsEnabled: value,
				ttsVoiceId: ttsVoiceId.value,
			});
		}
	},
});
const ttsVoiceId = computed({
	get: () => thread.value?.ttsVoiceId || '',
	set: (value) => {
		if (threadId.value) {
			threadStore.updateThread(threadId.value, {
				systemPrompt: systemPrompt.value,
				chatModel: chatModel.value,
				ttsEnabled: ttsEnabled.value,
				ttsVoiceId: value,
			});
		}
	},
});

const chatModel = computed({
	get: () => thread.value?.chatModel || 'gpt-3.5-turbo',
	set: (value) => {
		if (threadId.value && thread.value && value !== thread.value.chatModel) {
			threadStore.updateThread(threadId.value, {
				systemPrompt: systemPrompt.value,
				chatModel: value,
				ttsEnabled: ttsEnabled.value,
				ttsVoiceId: ttsVoiceId.value,
			});
		}
	},
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
		await threadStore.updateThread(threadId.value, {
			systemPrompt: systemPrompt.value,
			chatModel: chatModel.value,
			ttsEnabled: ttsEnabled.value,
			ttsVoiceId: ttsVoiceId.value,
		});
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

function startEditing(messageId: string) {
	editingMessageId.value = messageId;
}

function stopEditing() {
	editingMessageId.value = '';
}

function isEditing(messageId: string) {
	return editingMessageId.value === messageId;
}

function generateTTS(messageId: string) {
	threadStore.generateTTSFromMessage(threadId.value, messageId);
}
</script>
@/store/threads
