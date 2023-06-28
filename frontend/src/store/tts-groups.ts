import { defineStore } from 'pinia';
import { type TTSGroup } from '@shared/types/tts';
import * as api from '@/api/tts-groups';
(window as any).ttsApi = api;

interface UpdateTTSGroupOptions {
	groupId: string;
	name?: string;
	defaultTTSVoiceId?: string;
	defaultTTSVoiceStability?: number;
	defaultTTSVoiceSimilarityBoost?: number;
}

export const useGroupStore = defineStore({
	id: 'groups',
	state: () => ({
		groups: [] as TTSGroup[],
		currentGroupId: '',
		apiCallInProgress: false,
	}),
	actions: {
		setCurrentGroup(groupId: string) {
			this.currentGroupId = groupId;
			localStorage.setItem('selectedGroup', groupId);
		},
		setGroups(threads: TTSGroup[]) {
			this.groups = threads;
		},
		setGroup(groupArg: TTSGroup | string) {
			let group = groupArg as TTSGroup;
			if (typeof groupArg === 'string') {
				group = this.getGroup(groupArg) as TTSGroup;
				if (!group) return;
			}
			const groupIndex = this.groups.findIndex((t) => t.id === group.id);
			if (groupIndex !== -1) {
				this.groups[groupIndex] = group;
			}
		},
		getGroup(groupId: string) {
			return this.groups.find((t) => t.id === groupId);
		},
		async addTextToGroup({
			groupId,
			text,
			quiet,
		}: {
			groupId: string;
			text: string;
			quiet: boolean;
		}) {
			try {
				const group = await api.addText(groupId, text, quiet);
				this.setGroup(group);
			} catch (error: any) {
				console.error('Failed to add text to group:', error);
			}
		},
		async fetchGroups() {
			try {
				this.groups = await api.getGroups();
			} catch (error: any) {
				console.error('Failed to fetch threads:', error);
			}
		},
		async fetchGroup(groupId: string) {
			try {
				this.setGroup(await api.getGroupById(groupId));
			} catch (error: any) {
				console.error('Failed to fetch thread:', error);
			}
		},
		async createGroup({ name }: { name: string }) {
			try {
				const group = await api.createGroup(name);
				this.groups.push(group);
				this.setCurrentGroup(group.id);
			} catch (error: any) {
				console.error('Failed to create thread:', error);
			}
		},
		async deleteGroup(groupId: string) {
			try {
				await api.deleteGroup(groupId);
				await this.fetchGroups();
				if (this.currentGroupId === groupId) {
					this.currentGroupId = '';
				}
			} catch (error) {
				console.error('Failed to delete group:', error);
			}
		},
		async clearGroupHistory(groupId: string) {
			try {
				this.setGroup(await api.clearGroupHistory(groupId));
			} catch (error) {
				console.error('Failed to clear group history:', error);
			}
		},
		async updateGroup(data: UpdateTTSGroupOptions) {
			try {
				this.setGroup(await api.updateGroup(data));
			} catch (error) {
				console.error('Failed to update group:', error);
			}
		},
		async updateText(groupId: string, messageId: string, content: string) {
			try {
				this.setGroup(await api.updateText(groupId, messageId, content));
			} catch (error) {
				console.error('Failed to update text:', error);
			}
		},
		async deleteTextFromGroup({
			groupId,
			textId,
		}: {
			groupId: string;
			textId: string;
		}) {
			try {
				this.setGroup(await api.deleteTextFromGroup(groupId, textId));
			} catch (error: any) {
				console.error('Failed to delete text from group:', error);
			}
		},
		async generateTTSFromText(groupId: string, textId: string) {
			try {
				const group = await api.ttsFromText(groupId, textId);
				this.setGroup(group);
			} catch (error: any) {
				console.error('Failed to generate TTS from text:', error);
			}
		},
	},
});
