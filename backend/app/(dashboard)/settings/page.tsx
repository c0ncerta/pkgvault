import type { Metadata } from "next";
import { getServerSession } from "@/lib/session";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account settings and preferences",
};

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) return null;

  const user = {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
    role: (session.user as { role?: string }).role ?? "user",
  };

  return <SettingsForm initialUser={user} />;
}
