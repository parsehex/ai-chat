export type ServerMessageType =
	| 'new-message' // payload: MessageInfo
	| 'stream-message' // payload: StreamMessage
	| 'end-stream'; // payload: EndStream

export type WebsocketMessage_MessageInfo = {
	threadId: string;
	messageId: string;
	content: string;
};
export type WebsocketMessage_StreamMessage = {
	threadId: string;
	messageId: string;
	content: string;
	isFirstChunk: boolean;
};
export type WebsocketMessage_EndStream = {
	threadId: string;
	messageId: string;
};

export interface WebsocketMessageFromServer {
	type: ServerMessageType;
	payload: any;
}

export type ClientMessageType = 'subscribe' | 'unsubscribe';

export type WebsocketMessage_Payload = {
	threadId: string;
	messageId: string;
};

export interface WebsocketMessageFromClient {
	type: ClientMessageType;
	payload: WebsocketMessage_Payload;
}
