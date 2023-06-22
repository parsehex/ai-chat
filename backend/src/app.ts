import path from 'path';
import express from 'express';
import BodyParser from 'body-parser';
import cors from 'cors';
import { FRONTEND_PATH, TTS_PATH } from './const.js';

import chatRouter from './routes/chat.js';
import threadsRouter from './routes/threads.js';
import transcribeRouter from './routes/transcribe.js';
import ttsRouter from './routes/tts.js';

const app = express();

app.use(BodyParser.json());
app.use(cors());
app.use(express.static(FRONTEND_PATH));
app.use('/tts', express.static(TTS_PATH));

app.use(chatRouter);
app.use(threadsRouter);
app.use(transcribeRouter);
app.use(ttsRouter);

app.get('*', (req, res) => {
	res.sendFile(path.resolve(FRONTEND_PATH, 'index.html'));
});

export default app;
