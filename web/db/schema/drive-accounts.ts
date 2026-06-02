import { relations } from "drizzle-orm";
import {
  bigint,
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
import { users } from "./users";

export const driveStatusEnum = pgEnum("drive_account_status", [
  "active",
  "token_expired",
  "disconnected",
  "quota_exceeded",
]);

export const driveAccounts = pgTable(
  "drive_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    label: varchar("label", { length: 200 }),
    status: driveStatusEnum("status").notNull().default("active"),

    // OAuth tokens (encrypted at rest via application layer)
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),

    // Quota info (synced from Google Drive API)
    quotaTotalBytes: bigint("quota_total_bytes", { mode: "bigint" }),
    quotaUsedBytes: bigint("quota_used_bytes", { mode: "bigint" }),
    quotaUsedInTrashBytes: bigint("quota_used_in_trash_bytes", { mode: "bigint" }),
    fileCount: integer("file_count"),
    folderCount: integer("folder_count"),

    // PKGVault-specific stats (calculated from pkg_sources)
    pkgFileCount: integer("pkg_file_count").notNull().default(0),
    pkgTotalBytes: bigint("pkg_total_bytes", { mode: "bigint" }).notNull().default(BigInt(0)),

    isPrimary: boolean("is_primary").notNull().default(false),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    addedById: uuid("added_by_id").references(() => users.id, { onDelete: "set null" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("drive_accounts_status_idx").on(table.status),
    index("drive_accounts_email_idx").on(table.email),
  ],
);

export const driveAccountsRelations = relations(driveAccounts, ({ one }) => ({
  addedBy: one(users, {
    fields: [driveAccounts.addedById],
    references: [users.id],
  }),
}));
