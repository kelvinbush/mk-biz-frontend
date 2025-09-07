"use client";
import { Suspense } from "react";
import CompanyFinancials from "@/components/business-profile/company-details/company-financials";
import { withAuth } from "@/components/auth/RequireAuth";

function CompanyFinancialsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanyFinancials />
    </Suspense>
  );
}

export default withAuth(CompanyFinancialsPage);
