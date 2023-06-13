import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import app from './app.js';

const __dirname = url.fileURLToPath(new URL(import.meta.url));
const THREADS_PATH = path.resolve(__dirname, '../../threads');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
	console.log(`Server is running on port ${PORT}`);
	await fs.ensureDir(THREADS_PATH);
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});
