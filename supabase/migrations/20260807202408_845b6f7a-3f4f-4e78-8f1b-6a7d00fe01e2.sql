CREATE TABLE public.auth_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  purpose text NOT NULL DEFAULT 'password_reset',
  code_hash text NOT NULL,
  destination text,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_otp_codes_identifier_idx ON public.auth_otp_codes (lower(identifier), purpose, created_at DESC);
GRANT ALL ON public.auth_otp_codes TO service_role;
ALTER TABLE public.auth_otp_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.app_credentials (
  identifier text PRIMARY KEY,
  password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_credentials TO service_role;
ALTER TABLE public.app_credentials ENABLE ROW LEVEL SECURITY;