<template>
		<ThreadList />
	<div class="border-r border-gray-300 pr-4 h-screen">
	</div>
	<div class="content">
		<div class="thread-container">
			<Thread />
		</div>
		<MessageForm />
	</div>
</template>

<script setup lang="ts">
import ThreadList from './components/ThreadList.vue';
import Thread from './components/Thread.vue';
import MessageForm from './components/MessageForm.vue';
</script>

<style>
.app-grid {
	display: grid;
	grid-template-columns: 1fr 3fr;
	grid-gap: 1rem;
	height: 100vh;
	padding: 1rem;
}

.content {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding-left: 1rem;
	height: 100vh;
}

.thread-container {
	flex-grow: 1;
	overflow-y: auto;
}
</style>
