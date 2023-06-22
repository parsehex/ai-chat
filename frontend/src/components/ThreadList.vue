<template>
	<div>
		<h2>Threads</h2>
		<div>
			<form class="p-1 mb-1" @submit.prevent="createThread">
				<input
					class="p-1 border-2 border-gray-300 rounded-md"
					v-model="newThreadName"
					type="text"
					placeholder="New thread name"
				/>
				<button class="btn-succ" type="submit" title="Create thread">
					<font-awesome-icon icon="plus" />
				</button>
			</form>
			<select
				class="p-1 border-2 border-gray-300 rounded-md text-black"
				v-model="selectedVoice"
			>
				<option
					v-for="voice in ttsVoices"
					:key="voice.voice_id"
					:value="voice.voice_id"
				>
					{{ voice.name }}
				</option>
			</select>
		</div>
		<ul>
			<li
				:class="{
					'p-1': true,
					flex: true,
					'justify-between': true,
					'bg-gray-500': isSelectedThread(thread.id),
				}"
				v-for="thread in threads"
				:key="thread.id"
				@click="selectThread(thread.id)"
			>
				<span :class="{ 'font-bold': isSelectedThread(thread.id) }">
					{{ thread.name }}
				</span>
				<button
					class="btn-err ml-1"
					@click.prevent.stop="deleteThread(thread.id)"
					title="Delete thread"
				>
					<font-awesome-icon icon="trash" />
				</button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useThreadStore } from '@/stores/threads';
import { getTTSVoices } from '@/api';
import type { Voice } from '@shared/typesElevenLabs';

const store = useThreadStore();
const threads = computed(() => store.$state.threads);
const currentThread = computed(() => store.$state.currentThreadId);
const isSelectedThread = computed(() => {
	return (threadId: string) => threadId === currentThread.value;
});
const ttsVoices = ref([] as Voice[]);
const selectedVoice = computed({
	get: () => store.$state.ttsVoiceId as string,
	set: (value: string) => store.setTTSVoiceId(value),
});

let newThreadName = ref('');

onMounted(async () => {
	const lsSelectedThread = localStorage.getItem('selectedThread');
	if (lsSelectedThread) {
		store.setCurrentThread(lsSelectedThread);
	}
	const lsSelectedVoice = localStorage.getItem('ttsVoiceId');
	if (lsSelectedVoice) {
		store.setTTSVoiceId(lsSelectedVoice);
	}
	await store.fetchThreads();
	ttsVoices.value = await getTTSVoices();
});

async function createThread() {
	if (!newThreadName.value) return;
	await store.createThread({ name: newThreadName.value });
	newThreadName.value = ''; // reset the input field after creating a thread
}
async function deleteThread(threadId: string) {
	await store.deleteThread(threadId);
}

// Selects a thread and set it as the current thread
function selectThread(threadId: string) {
	store.setCurrentThread(threadId);
}
</script>

<style scoped>
ul {
	list-style: none;
	padding: 0;
}

/* .active {
	font-weight: bold;
}

button.delete {
	margin-left: 1rem;
} */
</style>
