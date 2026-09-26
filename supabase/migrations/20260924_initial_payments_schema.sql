-- Memento Database Schema Migration for Supabase
-- Purchases, Licenses, Entitlements, Activations, and Owned Mementos

-- 1. Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('memento', 'memento_custom', 'memento_complete', 'memento_duo', 'memento_four')),
  amount INTEGER NOT NULL, -- in INR paise (e.g. 28900)
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON purchases(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- 2. Licenses Table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('memento', 'memento_custom', 'memento_complete', 'memento_duo', 'memento_four')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
CREATE INDEX IF NOT EXISTS idx_licenses_purchase ON licenses(purchase_id);

-- 3. Owned Mementos Table
CREATE TABLE IF NOT EXISTS owned_mementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  memento_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_license_memento UNIQUE (license_id, memento_id)
);

CREATE INDEX IF NOT EXISTS idx_owned_mementos_license ON owned_mementos(license_id);

-- 4. License Activations Table (Desktop Device Activations)
CREATE TABLE IF NOT EXISTS license_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  platform TEXT NOT NULL, -- e.g. 'Windows', 'macOS'
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  CONSTRAINT uq_license_device UNIQUE (license_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_activations_license ON license_activations(license_id);
CREATE INDEX IF NOT EXISTS idx_activations_device ON license_activations(device_id);

-- 5. Row Level Security (RLS)
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE owned_mementos ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_activations ENABLE ROW LEVEL SECURITY;

-- Server-side service-role key has full access; anonymous browser queries are blocked from direct writes
CREATE POLICY "Service role full access on purchases" ON purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on licenses" ON licenses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on owned_mementos" ON owned_mementos
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on license_activations" ON license_activations
  FOR ALL TO service_role USING (true) WITH CHECK (true);
