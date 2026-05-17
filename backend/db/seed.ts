import "dotenv/config";
import { db } from "@/lib/db";
import {
  users, games, pkgFiles, forumThreads, forumPosts, votes,
  reports, auditLog,
} from "@/db/schema";

/**
 * Seed script — populate the database with comprehensive test data.
 * Run: npm run db:seed
 */
async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Users ────────────────────────────────────────────────
  const [admin] = await db.insert(users).values({ email: "admin@pkgvault.local", name: "Admin", role: "admin" }).onConflictDoNothing({ target: users.email }).returning();
  const [mod] = await db.insert(users).values({ email: "mod@pkgvault.local", name: "Moderator", role: "mod" }).onConflictDoNothing({ target: users.email }).returning();
  const [jdoe] = await db.insert(users).values({ email: "jdoe@protonmail.com", name: "jdoe", role: "user" }).onConflictDoNothing({ target: users.email }).returning();
  const [nyx] = await db.insert(users).values({ email: "nyx@pkgvault.local", name: "nyx", role: "user" }).onConflictDoNothing({ target: users.email }).returning();
  const [rebug] = await db.insert(users).values({ email: "rebug@pkgvault.local", name: "rebug_3", role: "user" }).onConflictDoNothing({ target: users.email }).returning();
  const [soldery] = await db.insert(users).values({ email: "soldery@pkgvault.local", name: "soldery", role: "user" }).onConflictDoNothing({ target: users.email }).returning();

  // If they already existed, fetch them so we have their IDs for relations
  const allUsers = await db.select().from(users);
  const getUserId = (email: string) => allUsers.find(u => u.email === email)!.id;
  
  const adminId = admin?.id ?? getUserId("admin@pkgvault.local");
  const modId = mod?.id ?? getUserId("mod@pkgvault.local");
  const jdoeId = jdoe?.id ?? getUserId("jdoe@protonmail.com");
  const nyxId = nyx?.id ?? getUserId("nyx@pkgvault.local");
  const rebugId = rebug?.id ?? getUserId("rebug@pkgvault.local");
  const solderyId = soldery?.id ?? getUserId("soldery@pkgvault.local");

  console.log("  ✓ 6 users ready");

  // ─── Games ────────────────────────────────────────────────
  const [g1] = await db.insert(games).values({ title: "BloodGarden", titleId: "CUSA-09812", region: "EU", platform: "PS4", description: "Survival horror — discover the garden where nothing grows twice." }).onConflictDoNothing().returning();
  const [g2] = await db.insert(games).values({ title: "NeonRift", titleId: "PPSA-04523", region: "US", platform: "PS5", description: "Cyberpunk racing with portal mechanics." }).onConflictDoNothing().returning();
  const [g3] = await db.insert(games).values({ title: "CipherWalker", titleId: "NPEB-02341", region: "EU", platform: "PS3", description: "Retro-styled puzzle platformer." }).onConflictDoNothing().returning();
  const [g4] = await db.insert(games).values({ title: "Halcyon Drift", titleId: "CUSA-18430", region: "US", platform: "PS4", description: "Space exploration roguelike." }).onConflictDoNothing().returning();
  const [g5] = await db.insert(games).values({ title: "Aetherframe", titleId: "CUSA-22100", region: "JP", platform: "PS4", description: "Mecha action RPG with crafting." }).onConflictDoNothing().returning();
  const [g6] = await db.insert(games).values({ title: "VoidRunner", titleId: "PPSA-08910", region: "US", platform: "PS5", description: "Fast-paced FPS with time rewind." }).onConflictDoNothing().returning();

  // If already exists, fetch to get IDs
  const allGames = await db.select().from(games);
  const getGameId = (titleId: string) => allGames.find(g => g.titleId === titleId)!.id;
  
  const g1Id = g1?.id ?? getGameId("CUSA-09812");
  const g2Id = g2?.id ?? getGameId("PPSA-04523");
  const g3Id = g3?.id ?? getGameId("NPEB-02341");
  const g4Id = g4?.id ?? getGameId("CUSA-18430");
  const g5Id = g5?.id ?? getGameId("CUSA-22100");
  const g6Id = g6?.id ?? getGameId("PPSA-08910");

  console.log("  ✓ 6 games ready");

  // ─── PKG Files ────────────────────────────────────────────
  const pkgData = [
    { uploaderId: jdoeId, gameId: g1Id, title: "BloodGarden v1.04", sha256: "a3f91c4d9b7e02fae9d4517c83af23c1d8e7a5f0b21c4d9b7e02fae9d4517c83", sizeBytes: BigInt(4_500_000_000), r2Key: "uploads/bloodgarden.pkg", version: "1.04", fwRequired: "9.00", status: "approved" as const, downloadCount: 142, originalFilename: "BloodGarden_v1.04.pkg" },
    { uploaderId: rebugId, gameId: g2Id, title: "NeonRift v2.10", sha256: "7e1cbb40d92f4a3e8c16b9d0a5f7e2c4d6b8a1f3e5c7d9b2a4f6e8c0d2b4a6f8", sizeBytes: BigInt(12_100_000_000), r2Key: "uploads/neonrift.pkg", version: "2.10", fwRequired: "4.03", status: "approved" as const, downloadCount: 231, originalFilename: "NeonRift_v2.10.pkg" },
    { uploaderId: nyxId, gameId: g3Id, title: "CipherWalker v1.02", sha256: "0091ff21a4b8c3d6e9f2a5b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7", sizeBytes: BigInt(1_700_000_000), r2Key: "uploads/cipherwalker.pkg", version: "1.02", fwRequired: "4.90", status: "approved" as const, downloadCount: 67, originalFilename: "CipherWalker_v1.02.pkg" },
    { uploaderId: solderyId, gameId: g4Id, title: "Halcyon Drift v1.01", sha256: "4ab299d3e6f2c8a1b4d7e0f3a6c9b2d5e8f1a4b7c0d3e6f9a2b5c8d1e4f7a0b3", sizeBytes: BigInt(8_300_000_000), r2Key: "uploads/halcyon.pkg", version: "1.01", fwRequired: "9.00", status: "pending" as const, downloadCount: 0, originalFilename: "HalcyonDrift_v1.01.pkg" },
    { uploaderId: jdoeId, gameId: g5Id, title: "Aetherframe v1.00", sha256: "2dd05566b3c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6c9b2d5e8f1a4b7c0d3e6", sizeBytes: BigInt(6_800_000_000), r2Key: "uploads/aetherframe.pkg", version: "1.00", fwRequired: "9.00", status: "pending" as const, downloadCount: 0, originalFilename: "Aetherframe_v1.00.pkg" },
    { uploaderId: nyxId, gameId: g6Id, title: "VoidRunner v0.9 beta", sha256: "c100aa11d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5", sizeBytes: BigInt(9_600_000_000), r2Key: "uploads/voidrunner.pkg", version: "0.9", fwRequired: "6.50", status: "rejected" as const, downloadCount: 0, originalFilename: "VoidRunner_v0.9_beta.pkg" },
    { uploaderId: rebugId, gameId: g1Id, title: "BloodGarden v1.00 (original)", sha256: "pending", sizeBytes: BigInt(4_200_000_000), r2Key: "uploads/bloodgarden-orig.pkg", version: "1.00", fwRequired: "9.00", status: "pending" as const, downloadCount: 0, originalFilename: "BloodGarden_v1.00.pkg" },
  ];

  await db.insert(pkgFiles).values(pkgData).onConflictDoNothing();
  console.log("  ✓ PKGs ready");

  // ─── Forum Threads ────────────────────────────────────────
  const [t1] = await db.insert(forumThreads).values({ authorId: adminId, title: "Welcome to PKGVault Forum!", category: "general", isPinned: true }).returning();
  const [t2] = await db.insert(forumThreads).values({ authorId: jdoeId, title: "PS5 firmware 9.04 — first confirmed exploits", category: "scene_news", postCount: 4 }).returning();
  const [t3] = await db.insert(forumThreads).values({ authorId: nyxId, title: "Complete guide: webMAN MOD 1.47 setup", category: "jailbreak", postCount: 8 }).returning();
  const [t4] = await db.insert(forumThreads).values({ authorId: solderyId, title: "PKG won't install — error CE-30005-8", category: "troubleshoot", postCount: 3 }).returning();
  const [t5] = await db.insert(forumThreads).values({ authorId: rebugId, title: "New homebrew apps for PS3 — Jan 2026 roundup", category: "releases", postCount: 5 }).returning();

  if (!t1 || !t2 || !t3 || !t4 || !t5) {
    throw new Error("Failed to create threads");
  }
  console.log("  ✓ 5 threads created");

  // ─── Forum Posts ──────────────────────────────────────────
  const postsData = [
    // t1 (welcome)
    { threadId: t1.id, authorId: adminId, bodyMd: "Welcome to the PKGVault community forum! Please read the rules before posting. Be respectful and helpful.", score: 15 },
    // t2 (exploits)
    { threadId: t2.id, authorId: jdoeId, bodyMd: "First functional PoC of a userland exploit for 9.04 just appeared. Only a controlled crash for now but it shows promise. Anyone else able to reproduce?", score: 28 },
    { threadId: t2.id, authorId: solderyId, bodyMd: "Confirmed crash on my dev kit (CUH-7216B). Payload doesn't land yet but the first ROP jump works.", score: 12 },
    { threadId: t2.id, authorId: nyxId, bodyMd: "Does anyone have the complete 9.04 firmware dump? I need to check libkernel_sys to compare with 9.00.", score: 3 },
    { threadId: t2.id, authorId: modId, bodyMd: "Reminder: do not link firmwares directly in the forum, only references. Marking this thread as hot.", score: 8 },
    // t3 (guide)
    { threadId: t3.id, authorId: nyxId, bodyMd: "Step 1: Download webMAN MOD 1.47.45 from the official repo.\nStep 2: Transfer via FTP to /dev_hdd0/plugins/\nStep 3: Reboot your PS3 and enable in XMB settings.", score: 22 },
    { threadId: t3.id, authorId: jdoeId, bodyMd: "Great guide! I'd add that for CFW users on 4.90, you need to install the HEN variant first.", score: 9 },
    { threadId: t3.id, authorId: rebugId, bodyMd: "Can confirm this works on REBUG 4.90.1. Make sure to disable COBRA first if updating from an older version.", score: 7 },
    // t4 (troubleshoot)
    { threadId: t4.id, authorId: solderyId, bodyMd: "I keep getting CE-30005-8 when installing a 12GB PKG. Already rebuilt database, tried different USB stick.", score: 2 },
    { threadId: t4.id, authorId: nyxId, bodyMd: "That error usually means corrupted download. Re-download and verify SHA-256 matches the catalog hash.", score: 5 },
    { threadId: t4.id, authorId: jdoeId, bodyMd: "Also check if your HDD has enough free space. The system needs ~2x the PKG size temporarily during install.", score: 4 },
    // t5 (releases)
    { threadId: t5.id, authorId: rebugId, bodyMd: "Here's a roundup of January 2026 homebrew releases for PS3:\n- RetroArch 1.18.0\n- webMAN MOD 1.47.45\n- Irisman 4.89\n- multiMAN 04.85.07", score: 18 },
    { threadId: t5.id, authorId: nyxId, bodyMd: "RetroArch 1.18.0 is a huge update, PPSSPP core finally works on PS3 with decent speeds.", score: 11 },
  ];

  await db.insert(forumPosts).values(postsData);
  console.log("  ✓ 13 posts created");

  // ─── Votes ────────────────────────────────────────────────
  console.log("  ✓ Votes skipped (scores set directly on posts)");

  // ─── Reports ──────────────────────────────────────────────
  const firstPost = postsData[0];
  if (firstPost) {
    await db.insert(reports).values({
      reporterId: nyxId, targetType: "forum_post", targetId: firstPost.threadId,
      reason: "Spam link in signature", status: "pending",
    });
  }
  console.log("  ✓ 1 report created");

  // ─── Audit Log ────────────────────────────────────────────
  await db.insert(auditLog).values({
    actorId: adminId, action: "seed.run", targetType: "system",
    metadata: { seedVersion: "2.0", timestamp: new Date().toISOString() },
  });
  console.log("  ✓ 1 audit entry created");

  console.log("\n✅ Seed complete!");
  console.log("   Users: 6 (1 admin, 1 mod, 4 users)");
  console.log("   Games: 6");
  console.log("   PKGs: 7 (3 approved, 3 pending, 1 rejected)");
  console.log("   Threads: 5 · Posts: 13");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
