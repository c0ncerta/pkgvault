import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ─── Enums ──────────────────────────────────────────────────
export const forumCategoryEnum = pgEnum("forum_category", [
  "general",
  "jailbreak",
  "troubleshoot",
  "scene_news",
  "releases",
  "off_topic",
]);

// ─── Forum Threads ──────────────────────────────────────────
export const forumThreads = pgTable(
  "forum_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 300 }).notNull(),
    category: forumCategoryEnum("category").notNull().default("general"),
    isPinned: boolean("is_pinned").notNull().default(false),
    isLocked: boolean("is_locked").notNull().default(false),
    postCount: integer("post_count").notNull().default(0),
    lastPostAt: timestamp("last_post_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("threads_author_idx").on(table.authorId),
    index("threads_category_idx").on(table.category),
    index("threads_pinned_last_post_idx").on(table.isPinned, table.lastPostAt),
    index("threads_created_idx").on(table.createdAt),
  ],
);

// ─── Forum Posts ────────────────────────────────────────────
export const forumPosts = pgTable(
  "forum_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => forumThreads.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"), // Nullable — top-level post if null
    bodyMd: text("body_md").notNull(), // Markdown content
    bodyHtml: text("body_html"), // Pre-rendered sanitized HTML
    score: integer("score").notNull().default(0),
    depth: integer("depth").notNull().default(0), // Nesting level (max 3 in UI)
    isEdited: boolean("is_edited").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("posts_thread_created_idx").on(table.threadId, table.createdAt),
    index("posts_author_idx").on(table.authorId),
    index("posts_parent_idx").on(table.parentId),
    index("posts_score_idx").on(table.score),
  ],
);

// ─── Relations ──────────────────────────────────────────────
export const forumThreadsRelations = relations(forumThreads, ({ one, many }) => ({
  author: one(users, {
    fields: [forumThreads.authorId],
    references: [users.id],
  }),
  posts: many(forumPosts),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  thread: one(forumThreads, {
    fields: [forumPosts.threadId],
    references: [forumThreads.id],
  }),
  author: one(users, {
    fields: [forumPosts.authorId],
    references: [users.id],
  }),
  parent: one(forumPosts, {
    fields: [forumPosts.parentId],
    references: [forumPosts.id],
    relationName: "post_replies",
  }),
  replies: many(forumPosts, {
    relationName: "post_replies",
  }),
}));
