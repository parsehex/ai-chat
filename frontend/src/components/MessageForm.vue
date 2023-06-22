<template>
	<form
		class="flex container p-1"
		v-if="threadId"
		@submit.prevent="sendMessage"
	>
		<button
			class="btn"
			type="button"
			@click="toggleRecording"
			:title="isRecording ? 'Stop recording' : 'Start recording'"
		>
			<font-awesome-icon
				:icon="isRecording ? 'stop-circle' : 'microphone'"
				:spin="isRecording"
			/>
		</button>
		<textarea
			class="flex-grow p-2 border-2 border-gray-300 rounded-md"
			v-model="message"
		></textarea>
		<AudioPlayer v-if="ttsUrl" :ttsUrl="ttsUrl" />
		<div class="inline-flex flex-col items-center">
			<span>Send:</span>
			<button class="btn" type="submit">No TTS</button>
			<button
				class="btn"
				type="button"
				@click="
					() => {
						useTTS = true;
						sendMessage();
					}
				"
			>
				TTS
			</button>
		</div>
		<div
			class="spinner border-t-2 border-indigo-500"
			v-if="threadStore.apiCallInProgress"
		></div>
	</form>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import axios from 'axios';
import { useThreadStore } from '@/stores/threads';
import type { Message } from '@shared/types';
import AudioPlayer from './AudioPlayer.vue';

const threadStore = useThreadStore();
const threadId = computed(() => threadStore.$state.currentThreadId);
const ttsVoice = computed(() => threadStore.$state.ttsVoiceId);
const message = ref('');
const useTTS = ref(false);
const ttsUrl = ref('');
const audio = ref(null as HTMLAudioElement | null);
const isRecording = ref(false);
const recordedAudio = ref(null as Blob | null);

let mediaRecorder: MediaRecorder | null = null;

const sendAudio = async () => {
	console.log('Uploading audio to server...');
	if (recordedAudio.value) {
		console.log(typeof recordedAudio.value);
		const formData = new FormData();
		formData.append('audio', recordedAudio.value, 'audio.webm');
		try {
			const res = await axios.post('/api/transcribe', formData);
			console.log('Transcription response:', res.data);
			if (res.data && res.data.transcription) {
				message.value = res.data.transcription;
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

		// push to chunks on 'dataavailable'
		mediaRecorder.addEventListener('dataavailable', (e) => {
			if (e.data.size > 0) {
				chunks.push(e.data);
			}
		});

		// save blob to ref on 'stop'
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

const pollTTS = async (url: string) => {
	return new Promise<void>((resolve, reject) => {
		const interval = setInterval(async () => {
			try {
				const response = await axios.head(url);
				if (response.status === 200) {
					clearInterval(interval);
					resolve();
				}
			} catch (error: any) {
				if (error.response && error.response.status !== 404) {
					clearInterval(interval);
					reject(error);
				}
			}
		}, 1000);
	});
};

const sendMessage = async () => {
	if (isRecording.value) {
		await sendAudio();
		if (mediaRecorder) {
			mediaRecorder.stop();
			isRecording.value = false;
		}
		//
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
		try {
			const updatedThread = await axios.post('/api/chat', {
				message: newMessage.content,
				id: threadId.value,
				tts: {
					enabled: useTTS.value,
					voice: ttsVoice.value,
				},
			});
			if (updatedThread.data) {
				threadStore.setThread(updatedThread.data.thread);
				if (updatedThread.data.ttsResponse) {
					await pollTTS(`/tts/${updatedThread.data.ttsResponse}`);
					ttsUrl.value = `/tts/${updatedThread.data.ttsResponse}`;
					setTimeout(() => {
						if (audio.value) {
							audio.value.play();
						}
					}, 1000);
				} else {
					ttsUrl.value = '';
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
textarea {
	color: #000;
}
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
