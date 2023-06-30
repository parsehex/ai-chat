import path from 'path';
import url from 'url';

export const __dirname = url.fileURLToPath(new URL(import.meta.url));

const root = path.resolve(__dirname, '../../../../..');

export const rootDataPath = path.join(root, 'data');
export const THREADS_PATH = path.join(rootDataPath, 'threads');
export const TTS_PATH = path.join(rootDataPath, 'tts');
export const TTS_GROUPS_PATH = path.join(rootDataPath, 'tts-groups');
export const UPLOADS_PATH = path.join(rootDataPath, 'uploads');
export const FRONTEND_PATH = path.join(root, 'frontend/dist');
