# SlideGenius AI (Web + iOS)

Vite + React app with Supabase Auth and Supabase Edge Functions. iOS is packaged via Capacitor (no Metro).

## Configure environment
Create `.env` with:
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_FUNCTIONS_BASE_URL=https://<project-ref>.functions.supabase.co
```

## Run web (dev)
```
npm install
npm run dev
```

## Build web
```
npm run build
```

## iOS (Capacitor)
1) Build web assets:
```
npm run build
```
2) Sync to iOS:
```
npm run ios:sync
```
3) Open Xcode:
```
npm run ios:open
```

If you change web code, rerun `npm run ios:refresh`.
