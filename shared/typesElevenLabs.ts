// ElevenLabs.*

// getVoices
export interface Voice {
	voice_id: string;
	name: string;
	samples: unknown | null;
	category: string; // 'premade'
	fine_tuning: {
		model_id: string | null;
		language: string | null;
		is_allowed_to_fine_tune: boolean;
		fine_tuning_requested: boolean;
		finetuning_state: string | null; // 'not_started'
		verification_attempts: unknown[] | null;
		verification_failures: unknown[] | null;
		verification_attempts_count: number;
		slice_ids: unknown | null;
		manual_verification: unknown | null;
		manual_verification_requested: boolean;
	};
	labels: {};
	description: string | null;
	preview_url: string; // 'https://storage.googleapis.com/.../1c4...mp3'
	available_for_tiers: unknown[];
	settings: unknown | null;
	sharing: unknown | null;
}

// getDefaultVoiceSettings, getVoiceSettings
export interface DefaultVoiceSettings {
	stability: 0.75;
	similarity_boost: 0.75;
}
