-- Custom migration: Full-Text Search index for pkg_files
-- Apply after Drizzle migrations: psql $DATABASE_URL -f db/migrations/custom/001_fts_index.sql

-- Create a generated tsvector column and GIN index for fast full-text search
ALTER TABLE pkg_files
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(original_filename, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS pkg_files_search_gin_idx
  ON pkg_files USING gin (search_tsv);

-- Useful for "similar packages" queries
CREATE INDEX IF NOT EXISTS pkg_files_game_status_idx
  ON pkg_files (game_id, status)
  WHERE deleted_at IS NULL;
