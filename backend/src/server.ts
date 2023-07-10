import path from 'path';
import {
	TTS_PATH,
	TTS_GROUPS_PATH,
	THREADS_PATH,
	rootDataPath,
	__dirname,
} from './const.js';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '../../../../.env') });

import fs from 'fs-extra';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
	console.log(`Server is running on port ${PORT}`);
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

(async () => {
	await fs.ensureDir(rootDataPath);
	await fs.ensureDir(THREADS_PATH);
	await fs.ensureDir(TTS_PATH);
	await fs.ensureDir(path.join(TTS_PATH, 'chat'));
	await fs.ensureDir(path.join(TTS_PATH, 'tts'));
	await fs.ensureDir(TTS_GROUPS_PATH);
	console.log('Data directories are ready');
})();
