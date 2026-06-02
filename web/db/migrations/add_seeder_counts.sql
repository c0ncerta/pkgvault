-- Add seeder/leecher counts to pkg_sources for torrent health tracking
ALTER TABLE pkg_sources
  ADD COLUMN IF NOT EXISTS seeder_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leecher_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS pkg_sources_seeder_idx ON pkg_sources (seeder_count);
