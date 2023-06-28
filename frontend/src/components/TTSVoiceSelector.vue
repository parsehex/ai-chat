<template>
	<select
		class="p-1 border-2 border-gray-300 rounded-md"
		v-model="internalValue"
	>
		<option
			v-for="voice in ttsVoices"
			:key="voice.voice_id"
			class="dark:bg-gray-700 dark:text-white"
			:value="voice.voice_id"
		>
			{{ voice.name }}
		</option>
	</select>
	<span
		v-if="cacheStore.elevenlabsLimit && !internalValue.startsWith('saytts')"
		class="ml-2 text-gray-500"
		:title="`Used ${cacheStore.elevenlabsLimit.character_count} characters out of ${cacheStore.elevenlabsLimit.character_limit}.`"
	>
		{{
			(
				(cacheStore.elevenlabsLimit.character_count /
					cacheStore.elevenlabsLimit.character_limit) *
				100
			).toFixed(1)
		}}% used
	</span>
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
	await cacheStore.fetchElevenlabsLimit();
});
</script>
