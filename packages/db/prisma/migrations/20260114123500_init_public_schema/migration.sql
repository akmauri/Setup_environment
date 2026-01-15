-- CreateTable: Create public.tenants table
CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "subdomain" VARCHAR(100),
    "tier" VARCHAR(50) NOT NULL DEFAULT 'free',
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Create unique index on tenants.subdomain
CREATE UNIQUE INDEX IF NOT EXISTS "tenants_subdomain_key" ON "public"."tenants"("subdomain");

-- CreateTable: Create public.migrations table
CREATE TABLE IF NOT EXISTS "public"."migrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Create unique index on migrations.name
CREATE UNIQUE INDEX IF NOT EXISTS "migrations_name_key" ON "public"."migrations"("name");
