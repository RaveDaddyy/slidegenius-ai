# SlideGenius AI (iOS)

React Native (Expo) app with Supabase Auth and Edge Functions.

## Setup
1. Update `app.json` → `extra.supabaseAnonKey` with your anon key.
2. iOS export requires Photos permission (already configured in `app.json`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npx expo start
   ```

## Required Supabase Functions
- `generate-slides`
- `generate-image`

Both require a valid Supabase session; users must sign in first.
