# Tamil Voice-to-Text

A simple, self-contained web page that converts Tamil M4A voice recordings into Tamil text, using the Sarvam AI Speech-to-Text API.

## How it works

Everything runs in your browser. When you upload an audio file, it is sent directly from your device to Sarvam's servers for transcription — it never passes through any other computer or server.

## How to use it

1. Open the page (link shared with you).
2. Paste your Sarvam API key into the "API Key" box. It is saved only in your own browser (localStorage) and is never uploaded anywhere.
3. Choose a transcription style (Clean transcript is recommended for most recordings).
4. Tap the upload box and choose one or more `.m4a` files, or drag them in.
5. Tap **Transcribe**.
6. When each file finishes, you can read the Tamil text on screen or tap **Download .txt** to save it.

## Getting an API key

1. Go to https://www.sarvam.ai and sign up (free credits included, no card required).
2. Go to your dashboard and create an API subscription key.
3. Paste that key into the app the first time you use it.

## Notes

- Supports multiple files in one session.
- "Tamil + English mixed speech" mode works well if the recording switches between Tamil and English mid-sentence.
- Accuracy depends on recording quality; noisy or heavily accented audio may need manual review afterward.
