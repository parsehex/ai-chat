<template>
	<span>
		<button
			class="btn"
			type="button"
			@click="playToggle"
			:disabled="!audioReady"
			title="Play audio"
		>
			<font-awesome-icon
				:icon="isPlaying ? 'pause' : 'play'"
				:spin="!audioReady"
			/>
		</button>
		<audio
			class="hidden"
			ref="audio"
			controls
			:src="realTTSUrl"
			@playing="onPlay"
			@pause="onPause"
			@ended="onPause"
		></audio>
	</span>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watchEffect } from 'vue';
import axios from 'axios';

const props = defineProps({
	ttsUrl: String,
});
const realTTSUrl = ref('');

const emits = defineEmits(['audioReady']);

const audio = ref(null as HTMLAudioElement | null);
const isPlaying = ref(false);
const audioReady = ref(false);

let interval: number | null = null;

function onPlay() {
	isPlaying.value = true;
}
function onPause() {
	isPlaying.value = false;
}

watchEffect(() => {
	if (audio.value && props.ttsUrl && realTTSUrl.value !== props.ttsUrl) {
		if (interval) {
			if (audio.value.src !== props.ttsUrl) {
				clearInterval(interval);
				interval = null;
			} else {
				return;
			}
		}
		audioReady.value = false;
		interval = setInterval(async () => {
			// check if audio is ready every 0.5s
			try {
				if (!props.ttsUrl) return;
				const response = await axios.head(props.ttsUrl || '');
				if (response.status === 200) {
					audioReady.value = true;
					if (interval) {
						clearInterval(interval);
						interval = null;
					}
					realTTSUrl.value = props.ttsUrl;
					emits('audioReady');
				}
			} catch (error: any) {
				if (error.response && error.response.status !== 404) {
					console.error('Failed to check audio status:', error);
					if (interval) {
						clearInterval(interval);
						interval = null;
					}
				}
			}
		}, 0.25);
	}
});

defineExpose({
	playToggle,
	play: () => {
		if (!props.ttsUrl || !audio.value || !audio.value.paused) {
			return;
		}
		if (audioReady.value) {
			audio.value.play();
			isPlaying.value = true;
		}
	},
});

onUnmounted(() => {
	if (interval) {
		clearInterval(interval);
	}
});

function playToggle() {
	if (!props.ttsUrl || !audio.value) {
		return;
	}
	if (audioReady.value) {
		if (!isPlaying.value) {
			audio.value.play();
			isPlaying.value = true;
		} else {
			audio.value.pause();
			isPlaying.value = false;
		}
	}
}
</script>
