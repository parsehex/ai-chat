<template>
	<select
		class="p-1 border-2 border-gray-300 rounded-md text-black"
		v-model="internalValue"
	>
		<option v-for="model in chatModels" :key="model" :value="model">
			{{ model }}
		</option>
	</select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getChatModels } from '@/api';
import type { ChatModel } from '@shared/types';

const chatModels = ref([] as ChatModel[]);

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
	chatModels.value = await getChatModels();
});
</script>
