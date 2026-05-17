import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  bigint,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { games } from "./games";

// ─── Enums ──────────────────────────────────────────────────
export const pkgStatusEnum = pgEnum("pkg_status", [
  "pending",    // Uploaded, waiting for mod review
  "approved",   // Reviewed and published
  "rejected",   // Mod rejected
  "taken_down",  // DMCA or mod takedown
]);

// ─── PKG Files ──────────────────────────────────────────────
export const pkgFiles = pgTable(
  "pkg_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uploaderId: uuid("uploader_id")
      .references(() => users.id, { onDelete: "set null" }),
    gameId: uuid("game_id").references(() => games.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    sha256: varchar("sha256", { length: 64 }).notNull(),
    sizeBytes: bigint("size_bytes", { mode: "bigint" }).notNull(),
    r2Key: varchar("r2_key", { length: 1024 }), // Nullable — PKGs may use external sources
    contentType: varchar("content_type", { length: 100 }),
    originalFilename: varchar("original_filename", { length: 500 }),
    version: varchar("version", { length: 50 }),
    fwRequired: varchar("fw_required", { length: 20 }), // e.g. "11.00"
    status: pkgStatusEnum("status").notNull().default("pending"),
    downloadCount: bigint("download_count", { mode: "number" })
      .notNull()
      .default(0),
    // Full-text search vector — auto-updated via trigger or computed
    searchVector: text("search_vector"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("pkg_files_sha256_idx").on(table.sha256),
    index("pkg_files_uploader_idx").on(table.uploaderId),
    index("pkg_files_game_idx").on(table.gameId),
    index("pkg_files_status_idx").on(table.status),
    index("pkg_files_created_idx").on(table.createdAt),
    // GIN index for full-text search (applied via raw SQL in migration)
    // index("pkg_files_search_idx").using("gin", sql`to_tsvector('english', ${table.title} || ' ' || coalesce(${table.description}, ''))`)
  ],
);

// ─── Relations ──────────────────────────────────────────────
export const pkgFilesRelations = relations(pkgFiles, ({ one }) => ({
  uploader: one(users, {
    fields: [pkgFiles.uploaderId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [pkgFiles.gameId],
    references: [games.id],
  }),
}));
