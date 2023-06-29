import path from 'path';
import url from 'url';

export const __dirname = url.fileURLToPath(new URL(import.meta.url));

const root = path.resolve(__dirname, '../../../../..');
const dataPath = path.join(root, 'data');

export const THREADS_PATH = path.resolve(dataPath, 'threads');
export const TTS_PATH = path.join(dataPath, 'tts');
export const TTS_GROUPS_PATH = path.join(dataPath, 'tts-groups');
export const UPLOADS_PATH = path.join(dataPath, 'uploads');
export const FRONTEND_PATH = path.join(root, 'frontend/dist');
