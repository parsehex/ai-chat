<template>
	<select
		class="p-1 border-2 border-gray-300 rounded-md text-black"
		v-model="internalValue"
	>
		<option
			v-for="voice in ttsVoices"
			:key="voice.voice_id"
			:value="voice.voice_id"
		>
			{{ voice.name }}
		</option>
	</select>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCacheStore } from '@/store/cache';

const cacheStore = useCacheStore();
const ttsVoices = computed(() => cacheStore.ttsVoices);

const props = withDefaults(
	defineProps<{
		modelValue?: string;
	}>(),
	{
		modelValue: '',
	}
);

const emit = defineEmits(['update:modelValue']);

const internalValue = computed({
	get: () => props.modelValue,
	set: (value: string) => emit('update:modelValue', value),
});

onMounted(async () => {
	await cacheStore.fetchTTSVoices();
});
</script>
