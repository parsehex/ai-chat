<template>
	<div class="flex-grow flex flex-col h-screen overflow-hidden">
		<div>
			<TTSVoiceSelector class="mr-1" v-model="groupDefaultVoiceId" />
			<label v-if="!group?.defaultTTS.voiceId.startsWith('saytts')">
				Stability
				<input
					class="ml-1"
					type="number"
					step="0.1"
					min="0"
					max="1"
					v-model.number="groupDefaultVoiceStability"
				/>
			</label>
			<label v-if="!group?.defaultTTS.voiceId.startsWith('saytts')">
				Similarity Boost
				<input
					class="ml-1"
					type="number"
					step="0.1"
					min="0"
					max="1"
					v-model.number="groupDefaultVoiceSimilarityBoost"
				/>
			</label>
		</div>
		<form class="sticky flex" @submit.prevent="addText">
			<FlexibleTextInput class="flex-grow" v-model="text" :hideButton="true" />
			<span class="inline-flex flex-col items-center justify-center">
				<button type="submit" class="btn-succ outline">Add Text</button>
				<label>
					Quiet
					<input type="checkbox" v-model="quiet" />
				</label>
			</span>
		</form>

		<ul v-if="group">
			<li
				v-for="text in group.texts"
				:key="text.id"
				class="flex justify-between p-1 border-b-2"
			>
				<span>{{ text.text }}</span>
				<span>
					<AudioPlayer v-if="text.audioUrl" :ttsUrl="text.audioUrl" />
					<button
						v-else
						class="btn-succ"
						@click="store.generateTTSFromText(group.id, text.id)"
						title="Generate TTS"
					>
						<font-awesome-icon icon="comment" />
					</button>
					<button
						class="btn-err"
						@click="
							store.deleteTextFromGroup({ groupId: group.id, textId: text.id })
						"
						title="Delete text"
					>
						<font-awesome-icon icon="trash" />
					</button>
				</span>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useGroupStore } from '@/store/tts-groups';
import AudioPlayer from '@/components/AudioPlayer.vue';
import FlexibleTextInput from '@/components/FlexibleTextInput.vue';
import TTSVoiceSelector from '@/components/TTSVoiceSelector.vue';

const text = ref('');
const quiet = ref(false);

const store = useGroupStore();

const selectedGroupId = computed(() => store.$state.currentGroupId);
const group = computed(() => {
	const currentGroup = store.$state.currentGroupId;
	return store.$state.groups.find((grp) => grp.id === currentGroup) || null;
});

const groupDefaultVoiceId = computed({
	get: () => group.value?.defaultTTS.voiceId || '',
	set: (value) => {
		if (group.value && value !== group.value.defaultTTS.voiceId) {
			store.updateGroup({
				groupId: group.value.id,
				defaultTTSVoiceId: value,
			});
		}
	},
});
const groupDefaultVoiceStability = computed({
	get: () => group.value?.defaultTTS.voiceStability || 0.25,
	set: (value) => {
		if (group.value && value !== group.value.defaultTTS.voiceStability) {
			store.updateGroup({
				groupId: group.value.id,
				defaultTTSVoiceStability: value,
			});
		}
	},
});
const groupDefaultVoiceSimilarityBoost = computed({
	get: () => group.value?.defaultTTS.voiceSimilarityBoost || 0.25,
	set: (value) => {
		if (group.value && value !== group.value.defaultTTS.voiceSimilarityBoost) {
			store.updateGroup({
				groupId: group.value.id,
				defaultTTSVoiceSimilarityBoost: value,
			});
		}
	},
});

const addText = async () => {
	if (text.value) {
		store.addTextToGroup({
			groupId: selectedGroupId.value,
			text: text.value,
			quiet: quiet.value,
		});
		text.value = '';
	}
};
</script>
