<template>
	<div>
		<h2>Threads</h2>
		<form @submit.prevent="createThread">
			<input
				v-model="newThreadName"
				type="text"
				placeholder="New thread name"
			/>
			<button class="btn-succ" type="submit">Create Thread</button>
		</form>
		<ul>
			<li
				:class="{
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
				>
					Delete
				</button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useThreadStore } from '@/stores/threads';

const store = useThreadStore();
const threads = computed(() => store.$state.threads);
const currentThread = computed(() => store.$state.currentThreadId);
const isSelectedThread = computed(() => {
	return (threadId: string) => threadId === currentThread.value;
});

let newThreadName = ref('');

onMounted(async () => {
	const lsSelectedThread = localStorage.getItem('selectedThread');
	if (lsSelectedThread) {
		store.setCurrentThread(lsSelectedThread);
	}
	await store.fetchThreads();
	// console.log(threads);
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
