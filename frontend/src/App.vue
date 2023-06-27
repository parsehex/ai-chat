<template>
	<div class="flex flex-col border-r border-gray-300 pr-4 h-screen">
		<div class="flex flex-row justify-around items-center">
			<router-link to="/chat" class="btn-succ">Chat</router-link>
			<router-link to="/tts" class="btn-succ">TTS</router-link>
			<router-link to="/stt" class="btn-succ">STT</router-link>
		</div>
		<component :is="sidebarComponent"></component>
	</div>
	<div>
		<router-view></router-view>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ChatSidebar from './views/sidebar/Chat.vue';
// import TTSSidebar from './components/TTSSidebar.vue'
// import STTSidebar from './components/STTSidebar.vue'

const route = useRoute();

const sidebarComponent = computed((): any => {
	switch (route.path) {
		case '/chat':
			return ChatSidebar;
		// case '/tts':
		// 	return TTSSidebar;
		// case '/stt':
		// 	return STTSidebar;
		default:
			return null;
	}
});
</script>
