import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL(import.meta.url));

export const THREADS_PATH = path.resolve(__dirname, '../../threads');
export const FRONTEND_PATH = path.join(__dirname, '../../../frontend/dist');
