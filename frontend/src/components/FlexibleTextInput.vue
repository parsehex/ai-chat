<template>
	<div class="relative border border-gray-300 rounded z-10 p-1">
		<button
			v-if="!hideButton"
			class="absolute top-0 left-0 m-1 text-xs text-gray-400"
			@click="toggleInputType"
		>
			Toggle
		</button>
		<component
			:is="inputType"
			class="w-full p-2 h-10 dark:bg-gray-700"
			:class="{ 'textarea-max-height': inputType === 'textarea' }"
			:value="modelValue"
			@input="updateValue"
			@keydown.ctrl.enter="submit"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

const emit = defineEmits(['update:modelValue', 'submit']);

let inputType = ref('textarea');

const updateValue = (event: InputEvent) => {
	const value = (event.target as HTMLInputElement).value;
	emit('update:modelValue', value);
};

const toggleInputType = () => {
	inputType.value = inputType.value === 'textarea' ? 'input' : 'textarea';
};

const submit = () => {
	emit('submit');
};
</script>

<style scoped>
textarea {
	max-height: 20vh;
}
</style>