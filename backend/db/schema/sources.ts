import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { pkgFiles } from "./pkg-files";
import { users } from "./users";

// ─── Source provider enum ───────────────────────────────────
export const sourceProviderEnum = pgEnum("source_provider", [
  "r2", // Cloudflare R2 (presigned URLs)
  "direct", // Direct HTTP link (NAS, CDN, etc.)
  "gdrive", // Google Drive
  "mega", // Mega.nz
  "mediafire", // MediaFire
  "archive_org", // Internet Archive (free, unlimited)
  "torrent", // Magnet link / torrent
  "onedrive", // OneDrive
  "other", // Any other provider
]);

export const sourceStatusEnum = pgEnum("source_status", [
  "alive", // Confirmed working
  "dead", // Confirmed broken
  "unknown", // Not yet checked
  "checking", // Currently being verified
]);

// ─── PKG Sources — download links managed by admin ──────────
export const pkgSources = pgTable(
  "pkg_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pkgId: uuid("pkg_id")
      .notNull()
      .references(() => pkgFiles.id, { onDelete: "cascade" }),
    provider: sourceProviderEnum("provider").notNull(),
    url: text("url").notNull(),
    label: varchar("label", { length: 200 }), // "Mirror EU", "Backup", etc.
    isPrimary: boolean("is_primary").notNull().default(false),
    status: sourceStatusEnum("status").notNull().default("unknown"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    lastAliveAt: timestamp("last_alive_at", { withTimezone: true }),
    failCount: integer("fail_count").notNull().default(0),
    downloadCount: integer("download_count").notNull().default(0),
    seederCount: integer("seeder_count").notNull().default(0),
    leecherCount: integer("leecher_count").notNull().default(0),
    addedById: uuid("added_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    notes: text("notes"), // Admin notes (internal)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("pkg_sources_pkg_idx").on(table.pkgId),
    index("pkg_sources_status_idx").on(table.status),
    index("pkg_sources_provider_idx").on(table.provider),
  ],
);

// ─── Link Reports — users report broken links ───────────────
export const linkReports = pgTable(
  "link_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => pkgSources.id, { onDelete: "cascade" }),
    reporterId: uuid("reporter_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reason: varchar("reason", { length: 500 }).notNull(),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("link_reports_source_idx").on(table.sourceId),
    index("link_reports_resolved_idx").on(table.resolved),
  ],
);

// ─── Relations ──────────────────────────────────────────────
export const pkgSourcesRelations = relations(pkgSources, ({ one, many }) => ({
  pkg: one(pkgFiles, {
    fields: [pkgSources.pkgId],
    references: [pkgFiles.id],
  }),
  addedBy: one(users, {
    fields: [pkgSources.addedById],
    references: [users.id],
  }),
  reports: many(linkReports),
}));

export const linkReportsRelations = relations(linkReports, ({ one }) => ({
  source: one(pkgSources, {
    fields: [linkReports.sourceId],
    references: [pkgSources.id],
  }),
  reporter: one(users, {
    fields: [linkReports.reporterId],
    references: [users.id],
  }),
}));
