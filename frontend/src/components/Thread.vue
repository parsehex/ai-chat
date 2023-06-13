<template>
	<div>
		<h2>Thread {{ thread?.name }}</h2>
		<button v-if="thread" @click="clearHistory">Clear History</button>
		<div class="system-prompt">
			<label for="systemPrompt">System prompt:</label>
			<input id="systemPrompt" v-model="systemPrompt" type="text" />
			<button @click="updateSystemPrompt">Update System Prompt</button>
		</div>
		<div ref="messageContainer" class="message-container">
			<div v-if="!thread">No thread selected</div>
			<div v-if="thread" v-for="(message, i) in thread.messages" :key="`${thread.id}-${i}`">
				<div>{{ message.role }}: {{ message.content }}</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useThreadStore } from '@/stores/threads'

const threadStore = useThreadStore()
const messageContainer = ref(null as HTMLDivElement | null)
const systemPrompt = ref('')

const threadId = computed(() => threadStore.$state.currentThreadId)
const thread = computed(() => {
	const currentThreadId = threadStore.$state.currentThreadId
	return threadStore.$state.threads.find(thread => thread.id === currentThreadId) || null
})

watchEffect(() => {
	if (threadId.value) {
		getThread(threadId.value)
	}
})

watchEffect(() => {
	console.log('thread changed');
	if (thread.value?.messages && messageContainer.value) {
		scrollToBottom()
	}
}, { flush: 'post' })

watchEffect(() => {
	if (thread.value?.systemPrompt) {
		systemPrompt.value = thread.value.systemPrompt
	}
})

async function updateSystemPrompt() {
	if (threadId.value) {
		await threadStore.updateSystemPrompt(threadId.value, systemPrompt.value)
	}
}

async function getThread(id: string) {
	await threadStore.fetchThread(id)
}

function scrollToBottom() {
	const lastMessage = messageContainer.value?.lastElementChild
	if (lastMessage) {
		lastMessage.scrollIntoView()
	}
}

async function clearHistory() {
	if (threadId.value) {
		await threadStore.clearThreadHistory(threadId.value)
	}
}
</script>

<style scoped>
.system-prompt {
	display: flex;
}

input {
	flex-grow: 1;
}
</style>
