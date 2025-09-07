"use client";

import { Suspense } from "react";
import InvestorOpportunities from "@/components/funding/investor-opportunities";
import { withAuth } from "@/components/auth/RequireAuth";

function InvestorOpportunitiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvestorOpportunities />
    </Suspense>
  );
}

export default withAuth(InvestorOpportunitiesPage);
