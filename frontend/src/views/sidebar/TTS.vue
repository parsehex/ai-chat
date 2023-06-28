<template>
	<div class="flex flex-col h-full overflow-hidden">
		<h2>Groups</h2>
		<div>
			<form class="p-1 mb-1" @submit.prevent="createGroup">
				<input
					class="p-1 border-2 border-gray-300 rounded-md"
					v-model="newGroupName"
					type="text"
					placeholder="New group name"
				/>
				<button class="btn-succ" type="submit" title="Create group">
					<font-awesome-icon icon="plus" />
				</button>
			</form>
		</div>
		<ul class="flex-grow list-none overflow-y-auto">
			<li
				v-for="group in groups"
				:class="{
					'p-1': true,
					flex: true,
					'justify-between': true,
					'bg-gray-500': isSelectedGroup(group.id),
				}"
				:key="group.id"
				@click="selectGroup(group.id)"
			>
				<DoubleClickableLabel
					v-model="group.name"
					@submit="renameGroup(group.id, $event)"
				/>
				<button
					class="btn-err ml-1"
					@click.prevent.stop="deleteGroup(group.id)"
					title="Delete group"
				>
					<font-awesome-icon icon="trash" />
				</button>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useGroupStore } from '@/store/tts-groups';
import DoubleClickableLabel from '@/components/DoubleClickableLabel.vue';

const groupStore = useGroupStore();
const groups = computed(() => groupStore.$state.groups);
const currentGroup = computed(() => groupStore.$state.currentGroupId);
const isSelectedGroup = computed(() => {
	return (groupId: string) => groupId === currentGroup.value;
});

let newGroupName = ref('');

onMounted(async () => {
	const lsSelectedGroup = localStorage.getItem('selectedGroup');
	if (lsSelectedGroup) {
		groupStore.setCurrentGroup(lsSelectedGroup);
	}
	await groupStore.fetchGroups();
});

async function createGroup() {
	if (!newGroupName.value) return;
	await groupStore.createGroup({ name: newGroupName.value });
	newGroupName.value = ''; // reset the input field after creating a thread
}
async function deleteGroup(groupId: string) {
	await groupStore.deleteGroup(groupId);
}

function selectGroup(groupId: string) {
	groupStore.setCurrentGroup(groupId);
}

function renameGroup(groupId: string, name: string) {
	groupStore.updateGroup({ groupId, name });
}
</script>
