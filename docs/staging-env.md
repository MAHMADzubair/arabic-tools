# Staging Environment Configuration

## Supabase credentials for Vercel Preview

- **SUPABASE_URL** – URL of the staging Supabase project (e.g., `https://ufyhkmrzpynbecapynned.supabase.co`).
- **SUPABASE_SERVICE_ROLE_KEY** – Service‑role key for the staging project **(do NOT commit this value).**

These variables must be set **only** in the Vercel *Preview* environment. Production uses its own separate values.

## Local development

- Create a `.env.local` file (git‑ignored) with the same variable names pointing to your local Supabase instance or staging project for testing.

## Security notes

- No fallback from Preview to Production credentials is implemented – missing credentials cause the server to return `null` and fail closed.
- Do not push `.env.local` or any real keys to the repository.
