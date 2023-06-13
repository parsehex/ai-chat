<template>
	<div>
		<h2>Threads</h2>
		<form @submit.prevent="createThread">
			<input v-model="newThreadName" type="text" placeholder="New thread name" />
			<button type="submit">Create Thread</button>
		</form>
		<ul>
			<li v-for="thread in threads" :key="thread.id">
				<span @click="selectThread(thread.id)" :class="{ 'active': thread.id === currentThread }"> {{ thread.name }}
				</span>
				<button class="delete" @click="deleteThread(thread.id)">Delete</button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useThreadStore } from '@/stores/threads'

const store = useThreadStore()
const threads = computed(() => store.$state.threads)
const currentThread = computed(() => store.$state.currentThreadId)

let newThreadName = ref('')

onMounted(async () => {
	await store.fetchThreads()
	// console.log(threads);
})

async function createThread() {
	if (!newThreadName.value) return
	await store.createThread({ name: newThreadName.value })
	newThreadName.value = ''  // reset the input field after creating a thread
}
async function deleteThread(threadId: string) {
	await store.deleteThread(threadId);
}

// Selects a thread and set it as the current thread
function selectThread(threadId: string) {
	store.setCurrentThread(threadId)
}
</script>

<style scoped>
ul {
	list-style: none;
	padding: 0;
}

.active {
	font-weight: bold;
}

button.delete {
	margin-left: 1rem;
}
</style>
