import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: Awaited<ReturnType<typeof getServerSession>> = null;
  try {
    session = await getServerSession();
  } catch {
    // DB offline
  }

  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "mod") {
    redirect("/");
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AdminSidebar role={role} userName={session?.user?.name ?? "Admin"} />
        <main style={{ padding: "32px 40px", overflow: "auto" }}>{children}</main>
      </div>
    </>
  );
}
