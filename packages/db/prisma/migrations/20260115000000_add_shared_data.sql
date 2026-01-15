-- Add Shared Data Tables to Public Schema
-- These tables contain reference data used across all tenants

-- Countries table
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(2) NOT NULL UNIQUE, -- ISO 3166-1 alpha-2
  name VARCHAR(255) NOT NULL,
  iso3 VARCHAR(3), -- ISO 3166-1 alpha-3
  numeric_code VARCHAR(3),
  phone_code VARCHAR(10),
  capital VARCHAR(255),
  currency VARCHAR(3),
  currency_name VARCHAR(100),
  region VARCHAR(100),
  subregion VARCHAR(100),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS countries_code_idx ON public.countries(code);
CREATE INDEX IF NOT EXISTS countries_name_idx ON public.countries(name);

-- Timezones table
CREATE TABLE IF NOT EXISTS public.timezones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- e.g., "America/New_York"
  abbreviation VARCHAR(10), -- e.g., "EST", "EDT"
  utc_offset VARCHAR(10), -- e.g., "-05:00"
  is_dst BOOLEAN DEFAULT false,
  country_code VARCHAR(2) REFERENCES public.countries(code),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS timezones_name_idx ON public.timezones(name);
CREATE INDEX IF NOT EXISTS timezones_country_code_idx ON public.timezones(country_code);

-- Platform metadata table (for social media platforms)
CREATE TABLE IF NOT EXISTS public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- youtube, instagram, tiktok, etc.
  display_name VARCHAR(100) NOT NULL,
  api_version VARCHAR(20),
  oauth_endpoint TEXT,
  api_base_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS platforms_name_idx ON public.platforms(name);
CREATE INDEX IF NOT EXISTS platforms_active_idx ON public.platforms(is_active);

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_countries_updated_at ON public.countries;
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_timezones_updated_at ON public.timezones;
CREATE TRIGGER update_timezones_updated_at
  BEFORE UPDATE ON public.timezones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_platforms_updated_at ON public.platforms;
CREATE TRIGGER update_platforms_updated_at
  BEFORE UPDATE ON public.platforms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
