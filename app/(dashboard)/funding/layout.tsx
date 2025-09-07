"use client";

import { Suspense } from "react";
import Funding from "@/components/funding/funding";
import { withAuth } from "@/components/auth/RequireAuth";

const FundingLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-4 flex justify-center items-center min-h-[200px]">
    <div className="animate-pulse text-gray-500">Loading...</div>
  </div>}>
    <Funding>{children}</Funding>
  </Suspense>
);

export default withAuth(FundingLayout);
