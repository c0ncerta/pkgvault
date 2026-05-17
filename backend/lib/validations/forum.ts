import { z } from "zod";

/** Validation schemas for forum operations */

export const createThreadSchema = z.object({
  title: z.string().min(3).max(300),
  category: z
    .enum(["general", "jailbreak", "troubleshoot", "scene_news", "releases", "off_topic"])
    .default("general"),
  bodyMd: z.string().min(1).max(30_000),
});

export const createPostSchema = z.object({
  threadId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  bodyMd: z.string().min(1).max(30_000),
});

export const voteSchema = z.object({
  targetType: z.enum(["post", "thread", "pkg_file"]),
  targetId: z.string().uuid(),
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]), // 0 = remove vote
});

export const threadListSchema = z.object({
  category: z
    .enum(["general", "jailbreak", "troubleshoot", "scene_news", "releases", "off_topic"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["newest", "active", "popular"]).default("active"),
});

export type CreateThread = z.infer<typeof createThreadSchema>;
export type CreatePost = z.infer<typeof createPostSchema>;
export type Vote = z.infer<typeof voteSchema>;
export type ThreadList = z.infer<typeof threadListSchema>;
