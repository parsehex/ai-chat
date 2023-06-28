import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { TTS_GROUPS_PATH } from '../const.js';
import { v4 } from 'uuid';
import { TTSGroup, TTSText } from '../../../shared/types/tts.js';
import { voices, convertTextToSpeech } from '../tts.js';

const router = Router();

router
	.route('/api/tts-groups')
	.get(async (req, res) => {
		// get groups
		try {
			const fileNames = await fs.readdir(TTS_GROUPS_PATH);
			const groups: TTSGroup[] = await Promise.all(
				fileNames.map(async (fileName) => {
					const filePath = path.join(TTS_GROUPS_PATH, fileName);
					const fileContent = await fs.readFile(filePath, 'utf-8');
					return JSON.parse(fileContent);
				})
			);
			res.json(groups);
		} catch (err: any) {
			console.log(err.message);
			res.status(500).json({ error: err.message });
		}
	})
	.post(async (req, res) => {
		// create group
		const { name } = req.body;
		if (!name) {
			return res.status(400).json({ error: 'Group name is required' });
		}

		try {
			const id = v4();
			const filePath = path.join(TTS_GROUPS_PATH, `${id}.json`);

			const group: TTSGroup = {
				id,
				name,
				defaultTTS: {
					voiceId: voices[0].voice_id,
					voiceStability: 0.5,
					voiceSimilarityBoost: 0.5,
				},
				texts: [],
			};

			await fs.writeFile(filePath, JSON.stringify(group));
			res.status(201).json(group);
		} catch (err: any) {
			// console.log(err);
			res.status(500).json({ error: err.message });
		}
	});

router
	.route('/api/tts-groups/:groupId')
	.get(async (req, res) => {
		// get group
		try {
			const groupId = req.params.groupId;
			const groupFilePath = path.join(TTS_GROUPS_PATH, `${groupId}.json`);
			const group: TTSGroup = JSON.parse(
				await fs.readFile(groupFilePath, 'utf-8')
			);
			res.json(group);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	})
	.delete(async (req, res) => {
		// delete group
		try {
			const groupId = req.params.groupId;
			const groupFilePath = path.join(TTS_GROUPS_PATH, `${groupId}.json`);
			await fs.remove(groupFilePath);
			res.json({ message: 'Group deleted' });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	})
	.patch(async (req, res) => {
		// update group
		try {
			const groupId = req.params.groupId;
			const {
				name,
				defaultTTSVoiceId,
				defaultTTSVoiceStability,
				defaultTTSVoiceSimilarityBoost,
			} = req.body;

			if (
				!name &&
				!defaultTTSVoiceId &&
				!defaultTTSVoiceStability &&
				!defaultTTSVoiceSimilarityBoost
			) {
				return res.status(400).json({ error: 'No data to update' });
			}

			const groupFilePath = path.join(TTS_GROUPS_PATH, `${groupId}.json`);
			const groupData = JSON.parse(await fs.readFile(groupFilePath, 'utf-8'));

			const group: TTSGroup = {
				...groupData,
			};
			if (name) group.name = name;
			if (defaultTTSVoiceId) group.defaultTTS.voiceId = defaultTTSVoiceId;
			if (defaultTTSVoiceStability)
				group.defaultTTS.voiceStability = defaultTTSVoiceStability;
			if (defaultTTSVoiceSimilarityBoost)
				group.defaultTTS.voiceSimilarityBoost = defaultTTSVoiceSimilarityBoost;

			await fs.writeFile(groupFilePath, JSON.stringify(group));

			res.json(group);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	});

router.route('/api/tts-groups/:groupId/clear').post(async (req, res) => {
	// clear texts
	try {
		const groupId = req.params.groupId;
		const groupFilePath = path.join(TTS_GROUPS_PATH, `${groupId}.json`);
		const groupData = JSON.parse(await fs.readFile(groupFilePath, 'utf-8'));

		const group: TTSGroup = {
			...groupData,
			texts: [],
		};

		await fs.writeFile(groupFilePath, JSON.stringify(group));

		res.json(group);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.route('/api/tts-groups/:groupId/text').post(async (req, res) => {
	// create text
	try {
		const groupId = req.params.groupId;
		const { text, voiceId, voiceStability, voiceSimilarityBoost, quiet } =
			req.body;
		if (!text && !voiceId && !voiceStability && !voiceSimilarityBoost) {
			return res.status(400).json({ error: 'No data to update' });
		}

		const groupFilePath = path.join(TTS_GROUPS_PATH, `${groupId}.json`);
		const groupData = JSON.parse(await fs.readFile(groupFilePath, 'utf-8'));

		const newText: TTSText = {
			id: v4(),
			text,
			audioUrl: '',
		};
		if (voiceId) newText.voiceId = voiceId;
		if (voiceStability) newText.voiceStability = voiceStability;
		if (voiceSimilarityBoost)
			newText.voiceSimilarityBoost = voiceSimilarityBoost;
		const group: TTSGroup = {
			...groupData,
			texts: [...groupData.texts, newText],
		};

		if (!quiet) {
			const audioUrl = await convertTextToSpeech(
				voiceId || group.defaultTTS.voiceId,
				text,
				'tts',
				voiceStability || group.defaultTTS.voiceStability,
				voiceSimilarityBoost || group.defaultTTS.voiceSimilarityBoost
			);
			newText.audioUrl = audioUrl;
		}

		await fs.writeFile(groupFilePath, JSON.stringify(group));

		res.json(group);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router
	.route('/api/tts-groups/:groupId/text/:textId/tts')
	.post(async (req, res) => {
		// generate tts
		try {
			const groupId = req.params.groupId;
			const textId = req.params.textId;
			const groupFilePath = path.join(TTS_GROUPS_PATH, `${groupId}.json`);
			const groupData = JSON.parse(await fs.readFile(groupFilePath, 'utf-8'));

			const group: TTSGroup = {
				...groupData,
			};

			const text = group.texts.find((text) => text.id === textId);
			if (!text) {
				return res.status(404).json({ error: 'Text not found' });
			}

			let voiceId = text.voiceId,
				voiceStability = text.voiceStability,
				voiceSimilarityBoost = text.voiceSimilarityBoost;
			if (!voiceId) {
				voiceId = group.defaultTTS.voiceId;
				voiceStability = group.defaultTTS.voiceStability;
				voiceSimilarityBoost = group.defaultTTS.voiceSimilarityBoost;
			}

			const audioUrl = await convertTextToSpeech(
				voiceId,
				text.text,
				'tts',
				voiceStability,
				voiceSimilarityBoost
			);
			text.audioUrl = audioUrl;

			await fs.writeFile(groupFilePath, JSON.stringify(group));

			res.json(group);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	});

router
	.route('/api/tts-groups/:groupId/text/:textId')
	.delete(async (req, res) => {
		// delete text
		try {
			const groupId = req.params.groupId;
			const textId = req.params.textId;
			const groupFilePath = path.join(TTS_GROUPS_PATH, `${groupId}.json`);
			const group: TTSGroup = JSON.parse(
				await fs.readFile(groupFilePath, 'utf-8')
			);

			group.texts = group.texts.filter((text) => text.id !== textId);

			await fs.writeFile(groupFilePath, JSON.stringify(group));

			res.json(group);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	})
	.patch(async (req, res) => {
		// update text
		try {
			const { groupId, textId } = req.params;
			const { text, voiceId, voiceStability, voiceSimilarityBoost } = req.body;

			if (!text && !voiceId && !voiceStability && !voiceSimilarityBoost) {
				return res.status(400).json({ error: 'No data to update' });
			}

			const groupFilePath = path.join(TTS_GROUPS_PATH, `${groupId}.json`);
			const group: TTSGroup = JSON.parse(
				await fs.readFile(groupFilePath, 'utf-8')
			);

			const textIndex = group.texts.findIndex((text) => text.id === textId);

			if (textIndex === -1) {
				return res.status(404).json({ error: 'Text not found' });
			}

			if (text) group.texts[textIndex].text = text;
			if (voiceId) group.texts[textIndex].voiceId = voiceId;
			if (voiceStability)
				group.texts[textIndex].voiceStability = voiceStability;
			if (voiceSimilarityBoost)
				group.texts[textIndex].voiceSimilarityBoost = voiceSimilarityBoost;

			await fs.writeFile(groupFilePath, JSON.stringify(group));

			res.json(group);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	});

export default router;
