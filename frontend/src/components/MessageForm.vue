<template>
	<form class="flex container" v-if="threadId" @submit.prevent="sendMessage">
		<button
			class="btn outline"
			type="button"
			@click="toggleRecording"
			:title="isRecording ? 'Stop recording' : 'Start recording'"
		>
			<font-awesome-icon
				:icon="isRecording ? 'stop-circle' : 'microphone'"
				:spin="isRecording"
			/>
		</button>
		<FlexibleTextInput
			class="flex-grow p-1 border-2 border-gray-300 text-black rounded-md mr-1"
			v-model="message"
			:hideButton="true"
		/>
		<button class="btn outline" type="submit">Send</button>
		<AudioPlayer
			ref="audio"
			v-if="ttsUrl"
			@audioReady="onAudioReady"
			:ttsUrl="ttsUrl"
		/>
		<div
			class="spinner border-t-2 border-indigo-500"
			v-if="threadStore.apiCallInProgress"
		></div>
	</form>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import * as api from '@/api';
import { useThreadStore } from '@/store/threads';
import type { Message } from '@shared/types/chat';
import AudioPlayer from './AudioPlayer.vue';
import FlexibleTextInput from './FlexibleTextInput.vue';
import { useCacheStore } from '@/store/cache';

const threadStore = useThreadStore();
const threadId = computed(() => threadStore.$state.currentThreadId);
const message = ref('');
const useTTS = ref(false);
const ttsUrl = ref('');
const audio = ref(null as typeof AudioPlayer | null);
const isRecording = ref(false);
const recordedAudio = ref(null as Blob | null);

let mediaRecorder: MediaRecorder | null = null;

const sendAudio = async () => {
	if (recordedAudio.value) {
		try {
			const url = await api.getTranscription(recordedAudio.value);
			ttsUrl.value = url.transcription;
			if (useTTS.value) {
				sendMessage();
			}
		} catch (error) {
			console.error('Failed to transcribe message:', error);
		}
	} else {
		console.error('No recorded audio to upload.');
	}
};

const toggleRecording = async () => {
	if (!isRecording.value) {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		mediaRecorder = new MediaRecorder(stream);
		const chunks: Blob[] = [];

		mediaRecorder.addEventListener('dataavailable', (e) => {
			if (e.data.size > 0) {
				chunks.push(e.data);
			}
		});

		mediaRecorder.addEventListener('stop', () => {
			recordedAudio.value = new Blob(chunks, { type: 'audio/webm' });
			sendAudio();
		});

		mediaRecorder.start();
		isRecording.value = true;
	} else if (mediaRecorder) {
		mediaRecorder.stop();
		isRecording.value = false;
	}
};

const onAudioReady = async () => {
	setTimeout(() => {
		if (audio.value) {
			audio.value.play();
		}
	}, 0);
};

const sendMessage = async () => {
	if (isRecording.value) {
		await sendAudio();
		if (mediaRecorder) {
			mediaRecorder.stop();
			isRecording.value = false;
		}
		return;
	}

	if (message.value) {
		threadStore.apiCallInProgress = true;
		const newMessage: Message = JSON.parse(
			JSON.stringify({
				role: 'user',
				content: message.value,
			})
		);
		message.value = '';
		threadStore.addMessageToThread({
			threadId: threadId.value,
			message: newMessage,
		});
		threadStore.scrollMessagesToBottom();
		try {
			const updatedThread = await api.sendMessage(
				threadId.value,
				newMessage.content
			);
			if (updatedThread) {
				threadStore.setThread(updatedThread);
				threadStore.scrollMessagesToBottom();
				// does last message have tts?
				if (updatedThread.messages.length > 0) {
					const lastMessage =
						updatedThread.messages[updatedThread.messages.length - 1];
					if (lastMessage.tts) {
						ttsUrl.value = lastMessage.tts;
						setTimeout(() => {
							useCacheStore().fetchElevenlabsLimit();
						}, 50);
					} else {
						ttsUrl.value = '';
					}
				}
			}
		} catch (error: any) {
			console.error('Failed to send message:', error);
		} finally {
			threadStore.apiCallInProgress = false;
		}
	}
};

onUnmounted(() => {
	if (mediaRecorder) {
		mediaRecorder.stop();
	}
});
</script>

<style scoped>
.spinner {
	width: 12px;
	height: 12px;
	border: 2px solid transparent;
	border-top-color: currentColor;
	border-radius: 9999px;
	animation: spin 1s linear infinite;
	color: #1c64f2;
	margin: 0 auto;
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
