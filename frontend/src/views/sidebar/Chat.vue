<template>
	<div class="flex flex-col h-full overflow-hidden">
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
		</div>
		<ul class="flex-grow list-none overflow-y-auto">
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
import { useThreadStore } from '@/store/threads';

const threadStore = useThreadStore();
const threads = computed(() => threadStore.$state.threads);
const currentThread = computed(() => threadStore.$state.currentThreadId);
const isSelectedThread = computed(() => {
	return (threadId: string) => threadId === currentThread.value;
});

let newThreadName = ref('');

onMounted(async () => {
	const lsSelectedThread = localStorage.getItem('selectedThread');
	if (lsSelectedThread) {
		threadStore.setCurrentThread(lsSelectedThread);
	}
	await threadStore.fetchThreads();
});

async function createThread() {
	if (!newThreadName.value) return;
	await threadStore.createThread({ name: newThreadName.value });
	newThreadName.value = ''; // reset the input field after creating a thread
}
async function deleteThread(threadId: string) {
	await threadStore.deleteThread(threadId);
}

function selectThread(threadId: string) {
	threadStore.setCurrentThread(threadId);
}
</script>
