import { SectionTabs } from "@/components/admin/section-tabs";
import type { Metadata } from "next";
import { Finder } from "./finder";

export const metadata: Metadata = { title: "Find & Create" };

export default function FindPage() {
  return (
    <div className="animate-fade-in">
      <SectionTabs
        tabs={[
          { label: "PKGs", href: "/admin/pkgs" },
          { label: "Sources & Health", href: "/admin/sources" },
          { label: "Find / Scrape", href: "/admin/sources/find" },
        ]}
      />
      <Finder />
    </div>
  );
}
