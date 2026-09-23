# Tamil Voice-to-Text

A simple, self-contained web page that converts Tamil M4A voice recordings into Tamil text, using the Sarvam AI Speech-to-Text API.

## How it works

Everything runs in your browser. Your audio is sent directly from your device to Sarvam's servers for transcription -- it never passes through any other computer or server.

- Recordings under ~25 seconds are transcribed instantly using Sarvam's real-time endpoint.
- Longer recordings automatically switch to Sarvam's Batch API: the file is uploaded, a background job processes it, and the app polls for the result every 30 seconds (up to 3 hours of waiting for very long files).

## Important limits

- **Maximum 2 hours per file.** Sarvam's Batch API hard-caps at 2 hours of audio per file. If a recording is longer, split it into two or more parts before uploading (any free audio splitter or even just re-recording in two sessions works).
- Processing time for long files varies -- a 2-hour recording may take anywhere from several minutes to over an hour to finish. Keep the browser tab open and your device awake while it works.
- If a job doesn't finish within 3 hours, it will show a timeout error -- this usually means the file should be split into smaller pieces.

## How to use it

1. Open the page (link shared with you).
2. Paste your Sarvam API key into the "API Key" box. It is saved only in your own browser (localStorage) and is never uploaded anywhere.
3. Choose a transcription style (Clean transcript is recommended for most recordings).
4. Tap the upload box and choose one or more `.m4a` files, or drag them in.
5. Tap **Transcribe**. Short files finish in seconds; long files show a live "processing" counter.
6. When each file finishes, you can read the Tamil text on screen or tap **Download .txt** to save it.

## Getting an API key

1. Go to https://www.sarvam.ai and sign up (free credits included, no card required).
2. Go to your dashboard and create an API subscription key.
3. Paste that key into the app the first time you use it.

## Notes

- "Tamil + English mixed speech" mode works well if the recording switches between Tamil and English mid-sentence.
- Accuracy depends on recording quality; noisy or heavily accented audio may need manual review afterward.
- Batch API billing is per second of audio processed (check your Sarvam dashboard for current rates), so a 2-hour recording will use noticeably more of your free credits than a short clip.
