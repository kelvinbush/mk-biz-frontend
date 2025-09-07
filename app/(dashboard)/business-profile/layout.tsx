"use client";

import { Suspense } from "react";
import BusinessProfile from "@/components/business-profile/business-profile";
import { withAuth } from "@/components/auth/RequireAuth";

const BusinessProfileLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <BusinessProfile>{children}</BusinessProfile>
  </Suspense>
);

export default withAuth(BusinessProfileLayout);
