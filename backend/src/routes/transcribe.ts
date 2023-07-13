import express from 'express';
import multer from 'multer';
import { UPLOADS_PATH, __dirname } from '../const.js';
import { getTranscription } from '../openai.js';

const router = express.Router();

const storage = multer.diskStorage({
	destination: UPLOADS_PATH,
	filename: function (req, file, cb) {
		// append the date and original file name
		cb(null, Date.now() + '-' + file.originalname);
	},
});
const upload = multer({ storage: storage });

router.post('/api/transcribe', upload.single('audio'), async (req, res) => {
	try {
		// @ts-ignore
		const audioFileInfo = req.file;
		if (!audioFileInfo) {
			return res.status(400).json({ error: 'No audio file provided' });
		}

		const transcription = getTranscription(audioFileInfo.path);
		console.log(transcription);
		res.json({ transcription: (await transcription).text });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error transcribing audio' });
	}
});

export default router;
