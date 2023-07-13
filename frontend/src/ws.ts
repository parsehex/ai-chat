import type { Thread } from '@shared/types/chat';
import { useThreadStore } from './store/threads';
import { io } from 'socket.io-client';

const socket = io();

socket.on('connect', () => {
	console.log('connected');
});

socket.on('disconnect', () => {
	console.log('disconnected');
});

socket.on('message', (msg) => {
	const store = useThreadStore();
	console.log('message', msg);
	let thread: Thread | undefined;
	let message: Thread['messages'][number] | undefined;
	switch (msg.type) {
		case 'new-message':
			console.log('new-message', msg.payload);
			const { threadId, messageId, content } = msg.payload;
			// subscribe
			socket.emit('subscribe', messageId);
			thread = store.threads.find((t) => t.id === threadId);
			if (thread) {
				message = thread.messages.find((m) => m.id === messageId);
				if (!message)
					thread.messages.push({
						id: messageId,
						role: 'assistant',
						content,
					});
				else message.content = content;
				store.scrollMessagesToBottom();
			}
			break;
		case 'stream-message':
			console.log('stream-message', msg.payload);
			thread = store.threads.find((t) => t.id === msg.payload.threadId);
			if (thread) {
				message = thread.messages.find((m) => m.id === msg.payload.messageId);
				if (!message)
					thread.messages.push({
						id: msg.payload.messageId,
						role: 'assistant',
						content: msg.payload.content,
					});
				else message.content += msg.payload.content;
			}
			break;
		case 'end-stream':
			console.log('end-stream', msg.payload);
			// unsubscribe
			socket.emit('unsubscribe', msg.payload.messageId);
			// HTTP request should finish which will
			//  result in the thread being updated
			break;
	}
});
