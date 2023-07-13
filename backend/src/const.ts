import path from 'path';
import url from 'url';

export const __dirname = path.resolve(
	url.fileURLToPath(new URL(import.meta.url)),
	'..'
);

const backendRoot = path.resolve(__dirname, '../../../..');

export const rootDataPath = path.join(backendRoot, 'data');
export const THREADS_PATH = path.join(rootDataPath, 'threads');
export const TTS_PATH = path.join(rootDataPath, 'tts');
export const TTS_GROUPS_PATH = path.join(rootDataPath, 'tts-groups');
export const UPLOADS_PATH = path.join(rootDataPath, 'uploads');
export const FRONTEND_PATH = path.join(backendRoot, 'frontend/dist');
