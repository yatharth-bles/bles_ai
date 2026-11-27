# BLES AI

A ChatGPT-style AI chat website with a secure Node.js backend. The browser never receives your provider API key.

## Requirements

- Node.js 18 or newer
- An API key from your AI provider
- A provider endpoint that supports the OpenAI-compatible Chat Completions API and streaming (`stream: true`)

## Setup

1. Install Node.js from https://nodejs.org/
2. Extract this project and open a terminal in the `bles-ai` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to a new file named `.env`.
   - Windows PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`

5. Edit `.env`:

   ```env
   AI_API_KEY=your_new_api_key
   AI_BASE_URL=https://your-provider.example/v1
   AI_MODEL=your-model-id
   AI_CHAT_PATH=/chat/completions
   PORT=3000
   ```

   `AI_BASE_URL` is the API base URL, not a webpage URL. `AI_MODEL` must be the exact model identifier supplied by your provider. Do not include `/chat/completions` in `AI_BASE_URL`; configure that separately with `AI_CHAT_PATH`.

6. Start BLES AI:

   ```bash
   npm start
   ```

7. Open http://localhost:3000

## Important: your provider is currently unknown

This project uses the widely supported OpenAI-compatible Chat Completions format. Since you selected "Other" but have not provided the provider's name or API documentation, the endpoint, model ID, authentication method, and streaming format cannot be confirmed yet.

If your provider does not support this format, the backend's `server.js` will need a small provider-specific adjustment. Do not send your API key in chat. Share only the provider name and its public API documentation URL if you want help adapting it.

## Security

- Keep the real key only in `.env` on the server.
- Never place secrets in `public/app.js`, `public/index.html`, or any browser code.
- Never commit `.env` to Git. `.gitignore` already excludes it.
- Revoke and replace any key that has been posted publicly or shared accidentally.
- For a public deployment, add authentication, rate limiting, HTTPS, and usage limits before exposing the app to other people.

## Project structure

```text
bles-ai/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```
