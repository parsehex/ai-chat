import { Server } from 'socket.io';
import http from 'http';

interface Message {
	threadId: string;
	messageId: string;
	content: string;
	subs?: string[];
}

const StreamingMessages: Message[] = [];

export let io: Server;

export function initWS(server: http.Server) {
	io = new Server(server);

	io.on('connection', (socket) => {
		console.log('a user connected');
		socket.on('subscribe', (msgId: string) => {
			console.log('subscribing to message', msgId);
			socket.join(msgId);

			// send the message if it has content
			const message = StreamingMessages.find((m) => m.messageId === msgId);
			if (message && message.content) {
				socket.to(message.messageId).emit('message', {
					type: 'stream-message',
					payload: {
						threadId: message.threadId,
						messageId: message.messageId,
						content: message.content,
						isFirstChunk: true,
					},
				});
			}
		});
		socket.on('unsubscribe', (msgId: string) => {
			console.log('unsubscribing from message', msgId);
			socket.leave(msgId);
		});
		socket.on('disconnect', () => {
			console.log('user disconnected');
		});
	});
}

export function beginStreamMessage(
	threadId: string,
	messageId: string,
	content = ''
) {
	StreamingMessages.push({ threadId, messageId, content });
	io.emit('message', {
		type: 'new-message',
		payload: {
			threadId,
			messageId,
			content,
		},
	});
}

export function streamMessageChunk(messageId: string, chunk: string) {
	console.log('streaming chunk', messageId, chunk);
	const message = StreamingMessages.find((m) => m.messageId === messageId);
	if (!message) return;
	if (!message.content) message.content = '';
	message.content += chunk || '';
	io.to(messageId).emit('message', {
		type: 'stream-message',
		payload: {
			threadId: message.threadId,
			messageId: message.messageId,
			content: chunk,
			isFirstChunk: false,
		},
	});
}

export function endStreamMessage(messageId: string) {
	const message = StreamingMessages.find((m) => m.messageId === messageId);
	if (!message) return;
	io.to(messageId).emit('message', {
		type: 'end-stream',
		payload: {
			threadId: message.threadId,
			messageId: message.messageId,
		},
	});
	setTimeout(() => {
		StreamingMessages.splice(StreamingMessages.indexOf(message), 1);
	}, 1000);
}
