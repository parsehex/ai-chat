export interface Message {
	id: string;
	role: string;
	content: string;
	// When we add support for keeping track of edits & regenerated messages, we'll need to change this to a string[] or possibly an array of objects
	// content: string | string[];
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

export type ChatModel = 'gpt-3.5-turbo' | 'gpt-4';
