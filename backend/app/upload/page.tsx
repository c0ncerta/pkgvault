import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { UploadWizard } from "./upload-wizard";

export const metadata: Metadata = {
  title: "Upload PKG",
  description: "Contribute a PKG file to the PKGVault archive",
};

export default function UploadPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 64px", position: "relative", zIndex: 1 }}>
        <Breadcrumb items={[{ label: "Catalog", href: "/catalog" }, { label: "Upload" }]} />
        <UploadWizard />
        <Footer />
      </main>
    </>
  );
}
