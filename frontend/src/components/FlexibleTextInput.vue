<template>
	<div class="relative border border-gray-300 rounded">
		<button
			v-if="!hideButton"
			class="absolute top-0 left-0 m-1 text-xs text-gray-400"
			@click="toggleInputType"
		>
			Toggle
		</button>
		<component
			:is="inputType"
			class="w-full p-2"
			:class="{ 'h-20': inputType === 'textarea' }"
			:value="modelValue"
			@input="updateValue"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';

defineProps({
	modelValue: {
		type: String,
		required: true,
	},
	hideButton: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['update:modelValue']);

let inputType = ref('input');
let lengthThreshold = 100;

const updateValue = (event: InputEvent) => {
	const value = (event.target as HTMLInputElement).value;
	emit('update:modelValue', value);
	if (value.length > lengthThreshold && inputType.value === 'input') {
		inputType.value = 'textarea';
	} else if (
		value.length <= lengthThreshold &&
		inputType.value === 'textarea'
	) {
		inputType.value = 'input';
	}
};

const toggleInputType = () => {
	inputType.value = inputType.value === 'input' ? 'textarea' : 'input';
};
</script>
