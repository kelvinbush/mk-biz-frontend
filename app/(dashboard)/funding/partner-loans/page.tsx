"use client";

import { Suspense } from "react";
import PartnerLoans from "@/components/funding/partner-loans";
import { withAuth } from "@/components/auth/RequireAuth";

function PartnerLoansPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerLoans />
    </Suspense>
  );
}

export default withAuth(PartnerLoansPage);
