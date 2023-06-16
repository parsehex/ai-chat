import path from 'path';
import url from 'url';

export const __dirname = url.fileURLToPath(new URL(import.meta.url));

export const THREADS_PATH = path.resolve(__dirname, '../../../../threads');
export const TTS_PATH = path.join(__dirname, '../../../../tts');
export const FRONTEND_PATH = path.join(
	__dirname,
	'../../../../../frontend/dist'
);
