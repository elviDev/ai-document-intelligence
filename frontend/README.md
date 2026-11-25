# DocIntel frontend

The DocIntel frontend is a React, TypeScript, and Vite application for the AI
Document Intelligence API. It provides a dashboard, document library and
search, document details, and document-specific AI chat.

## Run locally

1. Start the API and PostgreSQL service using the setup instructions in the
   repository's root [README](../README.md).
2. From this directory, install dependencies and start Vite:

   ```bash
   npm install
   npm run dev
   ```

3. Open the local URL printed by Vite (by default, `http://localhost:5173`).

The frontend uses `http://127.0.0.1:8000` as its default API URL. To change the
build-time default, copy `.env.example` to `.env.local` and set
`VITE_API_BASE_URL`. You can also change the API URL in **Settings**; that value
is saved in the current browser and takes precedence over the environment
variable. The API must allow requests from the frontend origin through CORS.

## Available commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

The current MVP supports PDF and DOCX uploads, keyword and semantic search,
document management, and source-aware question answering. It does not include
user accounts or persistent per-user preferences.
