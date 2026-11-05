# LoopOut

LoopOut is a marketplace for accommodation, local services, events and listings, built for South Africa.
Users can browse and save listings, message providers, request and manage bookings, leave reviews,
and use an AI help assistant.

## Repository layout

| Path | What it is |
| --- | --- |
| `api/` | Node.js / Express backend (ES modules) with MongoDB (Mongoose) and Firebase Admin auth. Entry point: `api/index.js` |
| `client/` | React + Vite web app (PWA), wrapped with Capacitor for Android and iOS |
| `mobile/` | Expo / React Native shell that loads the hosted web app in a WebView |
| `scripts/maintenance/` | One-off database scripts (backfills, seeding). Run manually with `node` |
| `scratch/` | Ad-hoc debugging scripts, not used by the app |
| `render.yaml`, `railway.json`, `firebase.json` | Deployment configuration |

## Local development

Requirements: Node.js 20 or 22, a MongoDB database.

```bash
# 1. Install
npm install --legacy-peer-deps
npm install --prefix client --legacy-peer-deps

# 2. Configure the backend
cp api/.env.example api/.env     # then fill in MONGO and JWT_SECRET at minimum

# 3. Run the API (http://localhost:3000)
npm run dev

# 4. Run the web app (separate terminal, http://localhost:5173, proxies /api to the API)
cd client && npm run dev
```

Tests: `npm test` (the backend tests use `mongodb-memory-server`, which downloads a MongoDB binary on first run).

## Environment variables

Backend variables are documented in [`api/.env.example`](api/.env.example). In production `MONGO` and `JWT_SECRET`
are required; the server refuses to start without them. `CLIENT_URL`, `APP_URL`, `BACKEND_URL`, `EMAIL_USER`,
`EMAIL_PASS` and `FIREBASE_SERVICE_ACCOUNT_JSON` are strongly recommended.

Web client variables are in [`client/.env.example`](client/.env.example). `VITE_API_BASE_URL` is needed whenever the
client is **not** served by the API itself (Firebase Hosting build, Android, iOS). If it is missing, those builds fall
back to the production API URL.

### CORS

The API only accepts credentialed browser requests from: `CLIENT_URL`, `APP_URL`, `RENDER_EXTERNAL_URL`, the Firebase
Hosting domains, `localhost` / `127.0.0.1` (any port), the Capacitor origins, and anything listed in the comma-separated
`CORS_ALLOWED_ORIGINS`. Origins are matched exactly. Add new front-end domains there.

## Deployment

- **API + web (Render):** `render.yaml` builds the client and serves it from the API (`npm run build`, `npm start`).
  Health check: `GET /api/health`.
- **Web only (Firebase Hosting):** GitHub Actions in `.github/workflows` build `client/` and deploy it. Set the
  repository variable `VITE_API_BASE_URL` (and the secret `VITE_GOOGLE_MAPS_API_KEY`) if they differ from the defaults.
- **Android / iOS:** see [`client/ANDROID_RELEASE.md`](client/ANDROID_RELEASE.md) and
  [`client/IOS_RELEASE.md`](client/IOS_RELEASE.md). The Play Store listing text is in
  [`PLAY_STORE_LISTING.md`](PLAY_STORE_LISTING.md).

## Security notes

- Never commit `.env` files, service-account JSON, keystores (`*.jks`) or `keystore.properties`; they are git-ignored.
- Firebase web API keys and `google-services.json` are public client configuration by design. Protect the project with
  Firebase security rules (`storage.rules`) and by restricting API keys to your domains.
- The AI endpoints have a stricter per-IP rate limit (`AI_RATE_LIMIT`, default 40 requests per 10 minutes).
