import { Metadata } from "next";
import PersonalInformation from "@/components/my-profile/components/personal-information";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Personal Information - Melanin Kapital",
  description: "Manage your personal information",
};

export default function PersonalInfoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PersonalInformation />
    </Suspense>
  );
}
