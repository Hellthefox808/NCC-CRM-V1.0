-- Migration: 20260811120000_bucket_tokenisation_storage_security.sql
-- Storage Capability & Bucket Tokenisation Security Schema (OWASP ASVS 5.0 / API Security)

-- 1. Create storage_upload_intents table
CREATE TABLE storage_upload_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opaque_intent_id text NOT NULL UNIQUE,
  user_id text NOT NULL,
  resource_type text NOT NULL, -- 'APPLICATION_DOCUMENT', 'CADET_PHOTO', 'ACTIVITY_MEDIA', 'CERTIFICATE'
  resource_id text NOT NULL,
  bucket text NOT NULL,
  object_key text NOT NULL UNIQUE,
  operation text NOT NULL DEFAULT 'UPLOAD', -- 'UPLOAD'
  allowed_mime text NOT NULL,
  max_size_bytes bigint NOT NULL,
  checksum text,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'UPLOADING', 'VERIFIED', 'EXPIRED', 'REVOKED', 'FAILED'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_storage_intents_user ON storage_upload_intents (user_id);
CREATE INDEX idx_storage_intents_status_exp ON storage_upload_intents (status, expires_at);
CREATE INDEX idx_storage_intents_token ON storage_upload_intents (token_hash);
GRANT ALL ON storage_upload_intents TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE storage_upload_intents ENABLE ROW LEVEL SECURITY';
END $$;

-- 2. Create storage_objects table
CREATE TABLE storage_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opaque_object_id text NOT NULL UNIQUE,
  bucket text NOT NULL,
  object_key text NOT NULL UNIQUE,
  owner_id text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  checksum text,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'QUARANTINED', 'DELETED'
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  deleted_at timestamptz
);

CREATE INDEX idx_storage_objects_owner ON storage_objects (owner_id);
CREATE INDEX idx_storage_objects_resource ON storage_objects (resource_type, resource_id);
CREATE INDEX idx_storage_objects_key ON storage_objects (object_key);
GRANT ALL ON storage_objects TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY';
END $$;

-- 3. Create storage_access_grants table
CREATE TABLE storage_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opaque_grant_id text NOT NULL UNIQUE,
  user_id text NOT NULL,
  object_id uuid NOT NULL REFERENCES storage_objects(id) ON DELETE CASCADE,
  operation text NOT NULL DEFAULT 'DOWNLOAD', -- 'DOWNLOAD', 'VIEW'
  grant_token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  status text NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'REVOKED', 'CONSUMED'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_storage_grants_user ON storage_access_grants (user_id);
CREATE INDEX idx_storage_grants_object ON storage_access_grants (object_id);
CREATE INDEX idx_storage_grants_token ON storage_access_grants (grant_token_hash);
GRANT ALL ON storage_access_grants TO service_role;

DO $$ BEGIN
  EXECUTE 'ALTER TABLE storage_access_grants ENABLE ROW LEVEL SECURITY';
END $$;
