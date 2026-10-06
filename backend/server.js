import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import agricultureRouter from './routes/agriculture.js';
import treatmentsRouter from './routes/treatments.js';
import weatherRouter from './routes/weather.js';
import imagesRouter from './routes/images.js';
import transcribeRouter from './routes/transcribe.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const frontendOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
  .map((item) => item.replace(/\/$/, ''));
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS !== 'false';

const isAllowedVercelPreview = (origin) => /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin || '');
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (frontendOrigins.length === 0) return true;
  if (frontendOrigins.includes(origin)) return true;
  if (allowVercelPreviews && isAllowedVercelPreview(origin)) return true;
  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  const groqKey = process.env.GROQ_API_KEY || '';
  const groqModel = process.env.GROQ_MODEL || 'qwen/qwen3.6-27b';
  const groqVisionModel = process.env.GROQ_VISION_MODEL || groqModel;
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY || '';
  const sarvamKey = process.env.SARVAM_API_KEY || '';
  const voiceIds = [
    process.env.ELEVENLABS_VOICE_ID,
    process.env.ELEVENLABS_VOICE_ID_EN,
    process.env.ELEVENLABS_VOICE_ID_HI,
  ].filter(Boolean);

  const aiConfigured = Boolean(groqKey);
  const ttsConfigured = Boolean(sarvamKey || (elevenLabsKey && voiceIds.length > 0));
  const ttsModel = sarvamKey ? (process.env.SARVAM_TTS_MODEL || 'bulbul:v3') : (process.env.ELEVENLABS_MODEL_ID || 'eleven_v3');

  res.json({
    ok: true,
    service: 'farmora-backend',
    aiConfigured,
    aiProvider: aiConfigured ? 'groq' : 'none',
    groqConfigured: aiConfigured,
    groqModel,
    groqVisionModel,
    agmarknetConfigured: Boolean(process.env.AGMARKNET_API_KEY),
    ttsConfigured,
    ttsModel,
  });
});

app.use('/api/agriculture', agricultureRouter);
app.use('/api/treatments', treatmentsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/images', imagesRouter);
app.use('/api/transcribe', transcribeRouter);

app.use((err, req, res, next) => {
  if (err && err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({ error: 'Unexpected server error' });
});

if (!process.env.GROQ_API_KEY) {
  console.warn('WARN: GROQ_API_KEY is not set. AI routes will fail until configured.');
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Farmora backend listening on http://0.0.0.0:${port}`);
});
