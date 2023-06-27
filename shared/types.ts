export interface Message {
	id: string;
	role: string;
	content: string;
	tts?: string;
}

export interface Thread {
	id: string;
	name: string;
	systemPrompt: string;
	messages: Message[];
	ttsEnabled: boolean;
	ttsVoiceId: string;
	chatModel: ChatModel;
}

export interface ChatRequest {
	threadId: string;
	message: string;
}

export interface ThreadRequest {
	name: string;
}

export type ChatModel = 'gpt-3.5-turbo' | 'gpt-4';

export interface TTSText {
	id: string;
	text: string;
	voiceId?: string;
	voiceStability?: number;
	voiceSimilarityBoost?: number;
	audioUrl: string;
}
export interface TTSGroup {
	id: string;
	name: string;
	defaultTTS: {
		voiceId: string;
		voiceStability: number;
		voiceSimilarityBoost: number;
	};
	texts: TTSText[];
}
