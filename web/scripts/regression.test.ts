import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSafeExternalReference, isSafeHttpUrl } from "@/lib/url-safety";
import { uploadRequestSchema } from "@/lib/validations/pkg";

const validSha = "a".repeat(64);

describe("upload request validation", () => {
  it("accepts metadata-only PKG submissions with SHA-256", () => {
    const parsed = uploadRequestSchema.safeParse({
      title: "Example PKG",
      filename: "example.pkg",
      contentType: "application/octet-stream",
      sizeBytes: 1_024,
      sha256: validSha,
      platform: "PS4",
      region: "EU",
    });

    assert.equal(parsed.success, true);
  });

  it("rejects placeholder or malformed SHA-256 values", () => {
    const parsed = uploadRequestSchema.safeParse({
      title: "Example PKG",
      filename: "example.pkg",
      contentType: "application/octet-stream",
      sizeBytes: 1_024,
      sha256: "client-pending",
      platform: "PS4",
    });

    assert.equal(parsed.success, false);
  });

  it("keeps frontend and backend size limits aligned at 20 GB", () => {
    const parsed = uploadRequestSchema.safeParse({
      title: "Huge PKG",
      filename: "huge.pkg",
      contentType: "application/octet-stream",
      sizeBytes: 20_000_000_001,
      sha256: validSha,
      platform: "PS5",
    });

    assert.equal(parsed.success, false);
  });
});

describe("server-side URL safety", () => {
  it("allows public http URLs and magnet links", () => {
    assert.equal(isSafeHttpUrl("https://archive.org/download/example/file.pkg"), true);
    assert.equal(isSafeExternalReference("magnet:?xt=urn:btih:0123456789abcdef"), true);
  });

  it("blocks localhost and private network URLs", () => {
    assert.equal(isSafeHttpUrl("http://localhost:3000/admin"), false);
    assert.equal(isSafeHttpUrl("http://127.0.0.1:3000/admin"), false);
    assert.equal(isSafeHttpUrl("http://10.0.0.12/file.pkg"), false);
    assert.equal(isSafeHttpUrl("http://192.168.1.2/file.pkg"), false);
    assert.equal(isSafeHttpUrl("http://169.254.169.254/latest/meta-data/"), false);
  });
});
