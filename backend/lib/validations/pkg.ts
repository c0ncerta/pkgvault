import { z } from "zod";

/** Validation schemas for PKG file operations */

export const uploadRequestSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  gameId: z.string().uuid().optional(),
  filename: z.string().min(1).max(500),
  contentType: z.string().max(100).default("application/octet-stream"),
  sizeBytes: z.number().int().positive().max(50_000_000_000), // 50GB max
  version: z.string().max(50).optional(),
  fwRequired: z.string().max(20).optional(),
});

export const uploadConfirmSchema = z.object({
  fileId: z.string().uuid(),
  sha256: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]+$/),
});

export const pkgSearchSchema = z.object({
  q: z.string().max(200).optional(),
  gameId: z.string().uuid().optional(),
  platform: z.string().max(20).optional(),
  status: z.enum(["pending", "approved", "rejected", "taken_down"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["newest", "oldest", "downloads", "title"]).default("newest"),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
export type UploadConfirm = z.infer<typeof uploadConfirmSchema>;
export type PkgSearch = z.infer<typeof pkgSearchSchema>;
