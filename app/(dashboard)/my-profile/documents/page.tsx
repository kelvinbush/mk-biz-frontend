import { Metadata } from "next";
import PersonalDocuments from "@/components/my-profile/components/personal-documents";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Personal Documents - Melanin Kapital",
  description: "Manage your personal documents",
};

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PersonalDocuments />
    </Suspense>
  );
}
