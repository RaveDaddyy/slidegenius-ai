# Supabase Edge Functions Setup

## Requirements
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- OpenAI API key

## Create project
1. Create a new Supabase project in the dashboard.
2. Create a Storage bucket named `slide-backgrounds` (or set a different name via `STORAGE_BUCKET`).
3. Enable Email/Password auth.

## Set secrets
```bash
supabase secrets set \
  OPENAI_API_KEY=your_openai_key \
  OPENAI_TEXT_MODEL=gpt-4.1 \
  OPENAI_IMAGE_MODEL=gpt-image-1 \
  STORAGE_BUCKET=slide-backgrounds \
  SERVICE_ROLE_KEY=your_service_role_key
```

## Deploy functions
```bash
supabase functions deploy generate-slides
supabase functions deploy generate-image
```

## Database migration (projects)
```bash
supabase db push
```

## Storage policy (recommended)
- Public read on `slide-backgrounds`
- Write access only via service role (Edge Function)

## Function endpoints
After deploy, you can call:
- `POST https://<project-ref>.functions.supabase.co/generate-slides`
- `POST https://<project-ref>.functions.supabase.co/generate-image`

Both require a valid Supabase `Authorization: Bearer <access_token>` header.
