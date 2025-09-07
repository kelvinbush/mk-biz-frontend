"use client";
import { Suspense } from "react";
import ComapnyOwnershipDetails from "@/components/business-profile/company-details/company-ownership";
import { withAuth } from "@/components/auth/RequireAuth";

function CompanyOwnershipPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComapnyOwnershipDetails />
    </Suspense>
  );
}

export default withAuth(CompanyOwnershipPage);
