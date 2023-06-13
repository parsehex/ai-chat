import path from 'path';
import express from 'express';
import BodyParser from 'body-parser';
import cors from 'cors';
import { FRONTEND_PATH } from './const.js';

import threadsRouter from './routes/threads.js';
import chatRouter from './routes/chat.js';

const app = express();

app.use(BodyParser.json());
app.use(cors());
app.use(express.static(FRONTEND_PATH));

app.use(threadsRouter);
app.use(chatRouter);

app.get('*', (req, res) => {
	res.sendFile(path.resolve(FRONTEND_PATH, 'index.html'));
});

export default app;
