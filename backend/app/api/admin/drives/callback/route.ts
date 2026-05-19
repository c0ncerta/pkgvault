import { driveAccounts } from "@/db/schema";
import { db } from "@/lib/db";
import { exchangeCodeForTokens } from "@/lib/gdrive-oauth";
import { requireRole } from "@/lib/session";
import { eq } from "drizzle-orm";
import { google } from "googleapis";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await requireRole("admin");

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/admin/drives?error=${error ?? "no_code"}`, request.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    if (!email) {
      return NextResponse.redirect(new URL("/admin/drives?error=no_email", request.url));
    }

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const about = await drive.about.get({ fields: "storageQuota" });
    const quota = about.data.storageQuota;

    const existing = await db
      .select({ id: driveAccounts.id })
      .from(driveAccounts)
      .where(eq(driveAccounts.email, email))
      .limit(1);

    const accountData = {
      email,
      accessToken: tokens.access_token ?? null,
      refreshToken: tokens.refresh_token ?? null,
      tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      quotaTotalBytes: quota?.limit ? BigInt(quota.limit) : null,
      quotaUsedBytes: quota?.usage ? BigInt(quota.usage) : null,
      quotaUsedInTrashBytes: quota?.usageInDriveTrash ? BigInt(quota.usageInDriveTrash) : null,
      status: "active" as const,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    };

    const first = existing[0];
    if (first) {
      await db.update(driveAccounts).set(accountData).where(eq(driveAccounts.id, first.id));
    } else {
      await db.insert(driveAccounts).values({
        ...accountData,
        addedById: session.user.id,
      });
    }

    return NextResponse.redirect(new URL("/admin/drives?connected=true", request.url));
  } catch (err) {
    console.error("Drive OAuth callback error:", err);
    return NextResponse.redirect(new URL("/admin/drives?error=auth_failed", request.url));
  }
}
