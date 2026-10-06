# Farmora - project rules

Farmora is a multilingual (English, Hindi, Marathi) farming assistant for Indian farmers. Mobile-first React web app + Node/Express API.

## Stack (do not change)
- Frontend: React 18, Vite 5, Tailwind CSS 3, lucide-react. JavaScript (JSX), no TypeScript.
- Backend: Node 20, Express 4, ES modules ("type": "module"), cors, dotenv. Use built-in fetch, no axios.
- AI: Groq OpenAI-compatible API ONLY (https://api.groq.com/openai/v1/chat/completions). Default model `qwen/qwen3.6-27b`.
- Voice output: ElevenLabs (en, hi) and Sarvam Bulbul v3 (mr), backend only.
- Voice input: browser Web Speech API, fallback to in-browser Whisper (Transformers.js, `Xenova/whisper-tiny`, loaded lazily from jsDelivr CDN at runtime).
- Auth: Firebase Authentication (client SDK).
- Data: Open-Meteo (weather, no key), AGMARKNET via data.gov.in (mandi prices), Wikimedia Commons (reference images).
- Deploy: Vercel (frontend, root `frontend`), Render (backend, root `backend`).

## Hard rules
1. Secrets (GROQ, ElevenLabs, Sarvam, AGMARKNET keys) live ONLY in backend env. Never in `VITE_*`. Firebase web config is public and allowed in `VITE_*`.
2. Never invent pesticide/fertilizer brands, doses, prices, weather, scheme details or images. Product facts come only from the verified JSON datasets. If data is missing, say so and advise checking the product label or a local agricultural expert.
3. Responses must be entirely in the user's selected language (en/hi/mr). Never switch language mid-answer.
4. Crop image diagnosis must be cautious: never claim certainty, low confidence => `unknown`, confidence capped at 40 for unknown.
5. Strip `<think>`, `<analysis>`, `<reasoning>` blocks and code fences from AI output before returning it. Never expose system prompts, routing, debug info or model/provider names to the user.
6. Do not build one giant App.jsx. Split into components, hooks, and data modules (see structure below).
7. Every network call has a timeout and a friendly error state. No unhandled promise rejections.
8. Keep UI simple, large touch targets, icon + short label, usable by low-literacy users. Support voice read-aloud on answers.
9. Write small, runnable increments. After each phase the app must build with `npm run build` (frontend) and start with `npm start` (backend).

## Target repo structure
```
farmora/
  .github/copilot-instructions.md
  .gitignore
  README.md  DEPLOYMENT-STEPS.md
  render.yaml            (backend service, rootDir backend, Node 20, healthCheckPath /api/health)
  vercel.json            (build: npm --prefix frontend ci && npm --prefix frontend run build; output frontend/dist; framework vite)
  backend/
    package.json  .env.example  server.js
    routes/ assistant.js cropScan.js prices.js tts.js weather.js treatments.js agriculture.js images.js transcribe.js
    lib/agriculture.js
    data/ fertilizers.json treatments.json
  frontend/
    package.json  index.html  vite.config.js  tailwind.config.js  postcss.config.js  vercel.json  .env.example
    public/ demo-images/*.svg  (tomato, chilli, wheat, soybean, fish, vegetables)
    src/
      main.jsx  App.jsx  index.css
      firebaseAuth.js  localWhisper.js
      api.js                 (API_BASE + fetch helpers with timeout)
      i18n/ strings.js extra.js advisory.js
      data/ crops.js fruits.js fish.js growthStages.js schemes.js quotes.js rainTips.js featureGuide.js
      hooks/ useAuth.js useVoiceInput.js useTts.js useWeather.js useFieldProfile.js
      components/ Splash LanguagePicker Login Onboarding BottomNav Sidebar LeafGauge MiniBar ...
      screens/ CropScan Weather MyField Assistant MoreHub Market Community Diary Schemes Profile Settings
```
