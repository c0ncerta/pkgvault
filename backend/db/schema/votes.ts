import {
  pgTable,
  uuid,
  varchar,
  integer,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ─── Enums ──────────────────────────────────────────────────
export const voteTargetEnum = pgEnum("vote_target_type", [
  "post",
  "thread",
  "pkg_file",
]);

// ─── Votes ──────────────────────────────────────────────────
export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: voteTargetEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    value: integer("value").notNull(), // +1 or -1
  },
  (table) => [
    // One vote per user per target
    uniqueIndex("votes_unique_idx").on(
      table.userId,
      table.targetType,
      table.targetId,
    ),
  ],
);

// ─── Relations ──────────────────────────────────────────────
export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
}));
