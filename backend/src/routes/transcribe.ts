import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { Readable } from 'stream';
import { __dirname } from '../const.js';
import FormData from 'form-data';

const router = express.Router();

const storage = multer.diskStorage({
	destination: 'uploads/',
	filename: function (req, file, cb) {
		// append the date and original file name
		cb(null, Date.now() + '-' + file.originalname);
	},
});
const upload = multer({ storage: storage });

const openai = axios.create({
	baseURL: 'https://api.openai.com/v1',
	headers: {
		Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		'Content-Type': 'multipart/form-data',
	},
});

router.post('/api/transcribe', upload.single('audio'), async (req, res) => {
	try {
		// @ts-ignore
		const audioFileInfo = req.file;
		if (!audioFileInfo) {
			return res.status(400).json({ error: 'No audio file provided' });
		}
		const formData = new FormData();
		const audioStream = fs.createReadStream(audioFileInfo.path);
		formData.append('file', audioStream, {
			filename: 'audio.webm',
			contentType: 'audio/webm',
		});
		formData.append('model', 'whisper-1');
		// formData.append('response_format', 'json');
		const response = await openai.post('/audio/transcriptions', formData, {
			headers: formData.getHeaders(),
		});
		const transcription = response.data.text;
		console.log(transcription);
		res.json({ transcription });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Error transcribing audio' });
	}
});

export default router;
