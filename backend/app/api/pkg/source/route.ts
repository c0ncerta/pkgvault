import { pkgFiles, pkgSources } from "@/db/schema";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/session";
import { detectProvider } from "@/lib/source-detect";
import { generateId } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const submitSourceSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  version: z.string().max(50).optional(),
  fwRequired: z.string().max(20).optional(),
  platform: z.string().max(20).optional(),
  region: z.string().max(10).optional(),
  sources: z
    .array(
      z.object({
        url: z.string().min(1).max(2048),
        label: z.string().max(200).optional(),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submitSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, description, version, fwRequired, platform, region, sources } = parsed.data;

  const fileId = generateId();

  await db.transaction(async (tx) => {
    await tx.insert(pkgFiles).values({
      id: fileId,
      uploaderId: session.user.id,
      title,
      description: description ?? null,
      sha256: "external",
      sizeBytes: 0n,
      r2Key: null,
      contentType: null,
      originalFilename: null,
      version: version ?? null,
      fwRequired: fwRequired ?? null,
      status: "pending",
    });

    for (const source of sources) {
      const provider = detectProvider(source.url);
      await tx.insert(pkgSources).values({
        pkgId: fileId,
        provider,
        url: source.url,
        label: source.label ?? null,
        isPrimary: false,
        status: "unknown",
        addedById: session.user.id,
      });
    }
  });

  return NextResponse.json({
    fileId,
    status: "pending",
    message: "Package submitted with external sources. Awaiting moderator review.",
  });
}
