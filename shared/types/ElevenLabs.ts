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

// /v1/user/subscription
export interface UserSubscription {
	tier: 'free' | 'starter' | 'creator';
	character_count: number;
	character_limit: number;
	can_extend_character_limit: boolean;
	allowed_to_extend_character_limit: boolean;
	next_character_count_reset_unix: number;
	voice_limit: number;
	professional_voice_limit: number;
	can_extend_voice_limit: boolean;
	can_use_instant_voice_cloning: boolean;
	can_use_professional_voice_cloning: boolean;
	currency: 'usd';
	status: 'trialing' | 'active';
	next_invoice: {
		amount_due_cents: number;
		next_payment_attempt_unix: number;
	};
	has_open_invoices: boolean;
}
