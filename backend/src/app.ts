import path from 'path';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import session from 'express-session';
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
	max: 10,
});

const app = express();

app.use(
	session({
		secret: process.env.SESSION_SECRET || 'secret',
		resave: false,
		saveUninitialized: true,
		cookie: { secure: process.env.IS_HTTPS === '1' },
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (AUTH_ENABLED) {
	app.get('/login', authLimiter, (req, res) => {
		res.send(`
			<form method="POST" action="/login">
				<label>Username: <input type="text" name="username"></label><br>
				<label>Password: <input type="password" name="password"></label><br>
				<button type="submit">Log In</button>
			</form>
		`);
	});

	app.post('/login', authLimiter, (req, res) => {
		const { username, password } = req.body;

		console.log(username, password);

		if (username === u && password === p) {
			// @ts-ignore
			req.session.user = true;
			res.redirect('/');
		} else {
			// @ts-ignore
			req.session.user = false;
			res.redirect('/login');
		}
	});

	app.use((req, res, next) => {
		// @ts-ignore
		if (req.session.user || req.path === '/login') {
			next();
		} else {
			res.redirect('/login');
		}
	});
} else {
	app.get('/login', (req, res) => {
		res.redirect('/');
	});
}

app.use(express.static(FRONTEND_PATH));
app.use('/tts', express.static(TTS_PATH));
app.use('/tts/chat', express.static(TTS_PATH + '/chat'));
app.use('/tts/tts', express.static(TTS_PATH + '/tts'));

if (process.env.NODE_ENV === 'production') {
	app.use(apiLimiter);
}
app.use(chatRouter);
app.use(threadsRouter);
app.use(transcribeRouter);
app.use(ttsRouter);
app.use(ttsGroupsRouter);

app.get('*', (req, res) => {
	res.sendFile(path.resolve(FRONTEND_PATH, 'index.html'));
});

export default app;
