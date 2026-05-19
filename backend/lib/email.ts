import { Resend } from "resend";

const resend = new Resend(process.env["RESEND_API_KEY"]);

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  const appUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  await resend.emails.send({
    from: "PKGVault <noreply@pkgvault.fun>",
    to,
    subject: "Verify your PKGVault email",
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;padding:32px;background:#0a0a0f;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#e0e0e0;font-size:1.5rem;margin:0;font-weight:800;letter-spacing:-0.02em">PKGVault</h1>
        </div>
        <p style="color:#a0a0b0;font-size:0.95rem;line-height:1.6;margin-bottom:24px">
          Click the button below to verify your email address and activate your PKGVault account.
        </p>
        <div style="text-align:center;margin-bottom:24px">
          <a href="${url}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:0.95rem">
            Verify Email
          </a>
        </div>
        <p style="color:#6b7280;font-size:0.8rem;line-height:1.5;margin:0">
          If you didn't create an account on PKGVault, you can safely ignore this email. The link expires in 24 hours.
        </p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:20px 0" />
        <p style="color:#4b5563;font-size:0.75rem;margin:0;text-align:center">
          PKGVault &middot; <a href="${appUrl}" style="color:#818cf8;text-decoration:none">${appUrl.replace("https://", "")}</a>
        </p>
      </div>
    `,
  });
}