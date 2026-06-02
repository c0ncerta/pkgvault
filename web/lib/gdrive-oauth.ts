import { driveAccounts } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env["GOOGLE_CLIENT_ID"],
    process.env["GOOGLE_CLIENT_SECRET"],
    `${process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"}/api/admin/drives/callback`,
  );
}

export function getGDriveAuthUrl(state?: string): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: state ?? "",
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function getAuthenticatedClient(accountId: string) {
  const [account] = await db
    .select()
    .from(driveAccounts)
    .where(eq(driveAccounts.id, accountId))
    .limit(1);

  if (!account?.refreshToken) throw new Error("No refresh token for this account");

  const client = getOAuth2Client();
  client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    expiry_date: account.tokenExpiresAt?.getTime(),
  });

  client.on("tokens", async (tokens) => {
    await db
      .update(driveAccounts)
      .set({
        accessToken: tokens.access_token ?? account.accessToken,
        tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(driveAccounts.id, accountId));
  });

  return client;
}

export async function syncDriveQuota(accountId: string) {
  const client = await getAuthenticatedClient(accountId);
  const drive = google.drive({ version: "v3", auth: client });

  const about = await drive.about.get({ fields: "storageQuota,user" });
  const quota = about.data.storageQuota;

  if (!quota) throw new Error("Could not fetch quota");

  await db
    .update(driveAccounts)
    .set({
      quotaTotalBytes: quota.limit ? BigInt(quota.limit) : null,
      quotaUsedBytes: quota.usage ? BigInt(quota.usage) : null,
      quotaUsedInTrashBytes: quota.usageInDriveTrash ? BigInt(quota.usageInDriveTrash) : null,
      status: "active",
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(driveAccounts.id, accountId));

  return {
    total: quota.limit ? BigInt(quota.limit) : null,
    used: quota.usage ? BigInt(quota.usage) : null,
    trash: quota.usageInDriveTrash ? BigInt(quota.usageInDriveTrash) : null,
  };
}

export async function getDriveFileCount(accountId: string) {
  const client = await getAuthenticatedClient(accountId);
  const drive = google.drive({ version: "v3", auth: client });

  let fileCount = 0;
  let folderCount = 0;
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: "trashed = false",
      fields: "nextPageToken,files(mimeType)",
      pageSize: 1000,
      pageToken,
    });

    for (const f of res.data.files ?? []) {
      if (f.mimeType === "application/vnd.google-apps.folder") {
        folderCount++;
      } else {
        fileCount++;
      }
    }

    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  await db
    .update(driveAccounts)
    .set({ fileCount, folderCount, updatedAt: new Date() })
    .where(eq(driveAccounts.id, accountId));

  return { fileCount, folderCount };
}
