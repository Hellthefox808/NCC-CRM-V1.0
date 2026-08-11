-- Migration: 20260811100000_cadet_lifecycle_activation_onboarding.sql
-- Controlled Cadet Lifecycle, Account Activation & Onboarding Progress Schema

-- 1. Create cadet_users table
CREATE TABLE IF NOT EXISTS public.cadet_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cadet_id text UNIQUE NOT NULL,
  application_id text NOT NULL,
  email text NOT NULL,
  password_hash text,
  role text NOT NULL DEFAULT 'CADET',
  account_status text NOT NULL DEFAULT 'ACTIVATION_PENDING', -- 'ACTIVATION_PENDING', 'ACTIVE', 'SUSPENDED'
  activated_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cadet_users_cadet_id ON public.cadet_users (cadet_id);
CREATE INDEX IF NOT EXISTS idx_cadet_users_email ON public.cadet_users (email);
CREATE INDEX IF NOT EXISTS idx_cadet_users_status ON public.cadet_users (account_status);
GRANT ALL ON public.cadet_users TO service_role;
ALTER TABLE public.cadet_users ENABLE ROW LEVEL SECURITY;

-- 2. Create account_activation_tokens table
CREATE TABLE IF NOT EXISTS public.account_activation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.cadet_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_activation_tokens_hash ON public.account_activation_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_account_activation_tokens_user ON public.account_activation_tokens (user_id);
GRANT ALL ON public.account_activation_tokens TO service_role;
ALTER TABLE public.account_activation_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Create onboarding_progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  user_id uuid PRIMARY KEY REFERENCES public.cadet_users(id) ON DELETE CASCADE,
  profile_completed boolean NOT NULL DEFAULT false,
  contact_verified boolean NOT NULL DEFAULT false,
  documents_verified boolean NOT NULL DEFAULT false,
  declaration_accepted boolean NOT NULL DEFAULT false,
  orientation_completed boolean NOT NULL DEFAULT false,
  onboarding_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.onboarding_progress TO service_role;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
