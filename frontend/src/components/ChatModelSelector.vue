<template>
	<select
		class="p-1 border-2 border-gray-300 rounded-md"
		v-model="internalValue"
	>
		<option
			v-for="model in chatModels"
			:key="model"
			class="dark:bg-gray-700 dark:text-white"
			:value="model"
		>
			{{ model }}
		</option>
	</select>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { ChatModel } from '@shared/types/chat';
import { useCacheStore } from '@/store/cache';

const cacheStore = useCacheStore();
const chatModels = computed(() => cacheStore.chatModels);

const props = withDefaults(
	defineProps<{
		modelValue?: ChatModel;
	}>(),
	{
		modelValue: 'gpt-3.5-turbo',
	}
);

const emit = defineEmits(['update:modelValue']);

const internalValue = computed({
	get: () => props.modelValue,
	set: (value: ChatModel) => emit('update:modelValue', value),
});

onMounted(async () => {
	await cacheStore.fetchChatModels();
});
</script>
