"use client";
import { Suspense } from "react";
import CompanyInformation from "@/components/business-profile/company-details/company-information";
import { withAuth } from "@/components/auth/RequireAuth";

function CompanyInformationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyInformation />
    </Suspense>
  );
}

export default withAuth(CompanyInformationPage);
