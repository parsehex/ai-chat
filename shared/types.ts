export interface Message {
	role: string;
	content: string;
}

export interface Thread {
	id: string;
	name: string;
	systemPrompt: string;
	messages: Message[];
}

export interface ChatRequest {
	threadId: string;
	message: string;
}

export interface ThreadRequest {
	name: string;
}
