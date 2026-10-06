# Farmora backend

This is the backend foundation for Farmora. The server exposes health and agriculture/weather/image data endpoints for the app.

## Scripts
- `npm start`: starts Express server on port `PORT` or `5000`
- `npm run dev`: runs nodemon-like watch mode

## Env
Copy `.env.example` to `.env` and fill the values as needed.

## Notes
- Uses ES modules (`"type": "module"`)
- Uses native fetch, no axios
- Uses CORS policy that allows local frontend dev plus Vercel previews if enabled
- Keeps all AI/API secrets only in backend environment variables
