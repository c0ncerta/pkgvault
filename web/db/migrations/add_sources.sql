-- Migration: Add PKG Sources system
-- This migration creates the pkg_sources and link_reports tables

-- Create enums
DO $$ BEGIN
  CREATE TYPE "source_provider" AS ENUM ('r2', 'direct', 'gdrive', 'mega', 'mediafire', 'archive_org', 'torrent', 'onedrive', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "source_status" AS ENUM ('alive', 'dead', 'unknown', 'checking');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create pkg_sources table
CREATE TABLE IF NOT EXISTS "pkg_sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "pkg_id" uuid NOT NULL REFERENCES "pkg_files"("id") ON DELETE CASCADE,
  "provider" "source_provider" NOT NULL,
  "url" text NOT NULL,
  "label" varchar(200),
  "is_primary" boolean NOT NULL DEFAULT false,
  "status" "source_status" NOT NULL DEFAULT 'unknown',
  "last_checked_at" timestamp with time zone,
  "last_alive_at" timestamp with time zone,
  "fail_count" integer NOT NULL DEFAULT 0,
  "download_count" integer NOT NULL DEFAULT 0,
  "added_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "notes" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create link_reports table
CREATE TABLE IF NOT EXISTS "link_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_id" uuid NOT NULL REFERENCES "pkg_sources"("id") ON DELETE CASCADE,
  "reporter_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "reason" varchar(500) NOT NULL,
  "resolved" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Make r2_key nullable (it was NOT NULL before)
ALTER TABLE "pkg_files" ALTER COLUMN "r2_key" DROP NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS "pkg_sources_pkg_idx" ON "pkg_sources" ("pkg_id");
CREATE INDEX IF NOT EXISTS "pkg_sources_status_idx" ON "pkg_sources" ("status");
CREATE INDEX IF NOT EXISTS "pkg_sources_provider_idx" ON "pkg_sources" ("provider");
CREATE INDEX IF NOT EXISTS "link_reports_source_idx" ON "link_reports" ("source_id");
CREATE INDEX IF NOT EXISTS "link_reports_resolved_idx" ON "link_reports" ("resolved");
