import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// ─── Games ──────────────────────────────────────────────────
export const games = pgTable(
  "games",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 500 }).notNull(),
    titleId: varchar("title_id", { length: 20 }), // e.g. CUSA12345
    region: varchar("region", { length: 10 }), // e.g. US, EU, JP
    platform: varchar("platform", { length: 20 }), // e.g. PS4, PS5
    coverUrl: text("cover_url"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("games_title_idx").on(table.title),
    index("games_title_id_idx").on(table.titleId),
    index("games_platform_idx").on(table.platform),
  ],
);

// Relations to pkgFiles are defined in pkg-files.ts to avoid circular imports
