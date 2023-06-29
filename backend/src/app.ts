import path from 'path';
import express from 'express';
import rateLimit from 'express-rate-limit';
import BodyParser from 'body-parser';
import cors from 'cors';
import { FRONTEND_PATH, TTS_PATH } from './const.js';

import chatRouter from './routes/chat.js';
import threadsRouter from './routes/threads.js';
import transcribeRouter from './routes/transcribe.js';
import ttsRouter from './routes/tts.js';
import ttsGroupsRouter from './routes/tts-groups.js';

const _15_MINUTES = 15 * 60 * 1000;

const AUTH_ENABLED = process.env.AUTH_ENABLED === '1';
const u = process.env.AUTH_USER;
const p = process.env.AUTH_PASSWORD;

const apiLimiter = rateLimit({
	windowMs: _15_MINUTES,
	max: 100,
});

const authLimiter = rateLimit({
	windowMs: _15_MINUTES,
	max: 5,
	skip: function (req, res) {
		const pathsToSkip = ['/tts', '/tts/chat', '/tts/tts', '/api'];
		if (pathsToSkip.some((path) => req.path.startsWith(path))) {
			return true;
		}

		return !req.headers.authorization; // Skip rate limiting if there's no Authorization header
	},
});

const app = express();

app.use(BodyParser.json());
app.use(cors());

if (HTTP_BASIC_AUTH) {
	if (!u || !p) {
		throw new Error(
			'HTTP_BASIC_AUTH_USER and HTTP_BASIC_AUTH_PASSWORD must be set if HTTP_BASIC_AUTH is set'
		);
	}
	console.log(
		'HTTP Basic Auth is enabled -- Username:',
		process.env.HTTP_BASIC_AUTH_USER
	);
	app.use(authLimiter);
} else {
	console.log('HTTP Basic Auth is disabled');
}
app.use((req, res, next) => {
	if (!HTTP_BASIC_AUTH) {
		// No HTTP_BASIC_AUTH env variable, no auth
		return next();
	}

	const reject = () => {
		res.setHeader('www-authenticate', 'Basic');
		res.sendStatus(401);
	};

	const authorization = req.headers.authorization;

	if (!authorization) {
		return reject();
	}

	const [username, password] = Buffer.from(
		authorization.replace('Basic ', ''),
		'base64'
	)
		.toString()
		.split(':');

	if (!(username === u && password === p)) {
		return reject();
	}

	next();
});

app.use(express.static(FRONTEND_PATH));
app.use('/tts', express.static(TTS_PATH));
app.use('/tts/chat', express.static(TTS_PATH + '/chat'));
app.use('/tts/tts', express.static(TTS_PATH + '/tts'));

app.use(apiLimiter);
app.use(chatRouter);
app.use(threadsRouter);
app.use(transcribeRouter);
app.use(ttsRouter);
app.use(ttsGroupsRouter);

app.get('*', (req, res) => {
	res.sendFile(path.resolve(FRONTEND_PATH, 'index.html'));
});

export default app;
