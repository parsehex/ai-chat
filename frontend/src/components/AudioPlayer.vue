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
		<audio class="hidden" ref="audio" controls :src="ttsUrl"></audio>
	</span>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

const props = defineProps({
	ttsUrl: String,
});

const audio = ref(null as HTMLAudioElement | null);
const isPlaying = ref(false);

watchEffect(() => {
	if (audio.value && props.ttsUrl) {
		audio.value.src = props.ttsUrl;
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

	}
});

function playToggle() {
	if (!props.ttsUrl || !audio.value) {
		return;
	}
	if (!isPlaying.value) {
		audio.value.play();
		isPlaying.value = true;
	} else {
		audio.value.pause();
		isPlaying.value = false;
	}
};
</script>
