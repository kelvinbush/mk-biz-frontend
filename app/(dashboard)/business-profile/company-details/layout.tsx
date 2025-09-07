"use client";

import { Suspense } from "react";
import CompanyDetails from "@/components/business-profile/company-details";

export default function CompanyDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={"pb-6"}>
      <Suspense fallback={<div>Loading...</div>}>
        <CompanyDetails>{children}</CompanyDetails>
      </Suspense>
    </div>
  );
}
