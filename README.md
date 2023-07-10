# ai-chat

## Setup

1. npm install
2. In backend/, rename .env.sample to .env and fill in the values
3. npm run build
4. npm start

## TTS

The app is setup to support ElevenLabs voices with an API key. SayTTS is used if supported on your platform (if so, saytts voices will show up in the returned available voices). I believe Mac and Windows is supported.

Alternatively, support for Coqui TTS is being added. Install with `pip install TTS`, get a list of models with `tts-server --list_models`, and start the server with e.g. `tts-server --model_name tts_models/en/sam/tacotron-DDC`.

When this app starts, it will request `localhost:5002/voices` and if there's a voice returned, the voice will show as an available voice in the app.
