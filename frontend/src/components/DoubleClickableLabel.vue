<template>
	<div class="flex justify-center items-center">
		<span
			v-if="!isEditing"
			@dblclick="enableEditing"
			class="cursor-pointer select-none"
		>
			{{ modelValue }}
		</span>
		<input
			v-else
			v-model="tempValue"
			@keyup.enter="submit"
			@keyup.esc="cancel"
			@blur="cancel"
			@input="updateValue"
			type="text"
			class="border p-2"
			ref="labelInput"
			autofocus
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
	modelValue: {
		type: String,
		required: true,
	},
});

const emit = defineEmits(['update:modelValue', 'submit']);

const labelInput = ref(null as HTMLInputElement | null);

let isEditing = ref(false);
let tempValue = ref(props.modelValue);

const enableEditing = () => {
	isEditing.value = true;
	console.log(labelInput.value);
};

const submit = () => {
	emit('submit', tempValue.value);
	isEditing.value = false;
};

const cancel = () => {
	isEditing.value = false;
	tempValue.value = props.modelValue;
};

function updateValue(event: Event) {
	const value = (event.target as HTMLInputElement).value;
	tempValue.value = value;
	emit('update:modelValue', value);
}

onMounted(() => {
	watch(
		() => isEditing.value,
		(newValue) => {
			if (newValue) {
				nextTick(() => {
					labelInput.value?.focus();
				});
			}
		}
	);
});
</script>
