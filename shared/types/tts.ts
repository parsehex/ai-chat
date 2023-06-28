export interface TTSText {
	id: string;
	text: string;
	voiceId?: string;
	voiceStability?: number;
	voiceSimilarityBoost?: number;
	audioUrl: string;
}
export interface TTSGroup {
	id: string;
	name: string;
	defaultTTS: {
		voiceId: string;
		voiceStability: number;
		voiceSimilarityBoost: number;
	};
	texts: TTSText[];
}
