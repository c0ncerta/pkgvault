import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { NewThreadForm } from "./new-thread-form";

export const metadata: Metadata = {
  title: "New Thread",
  description: "Start a new discussion on the PKGVault forum",
};

export default function NewThreadPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 64px" }}>
        <Breadcrumb items={[{ label: "Forum", href: "/forum" }, { label: "New Thread" }]} />
        <NewThreadForm />
      </main>
    </>
  );
}
