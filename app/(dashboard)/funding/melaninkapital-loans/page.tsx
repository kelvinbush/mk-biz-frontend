"use client";

import { Suspense } from "react";
import MelaninkapitalLoans from "@/components/funding/melaninkapital-loans";
import { withAuth } from "@/components/auth/RequireAuth";

function MelaninkapitalLoansPage() {
  return (
    <Suspense fallback={
      <div className="p-4 flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    }>
      <div className="w-full max-w-full px-2 md:px-4">
        <MelaninkapitalLoans />
      </div>
    </Suspense>
  );
}

export default withAuth(MelaninkapitalLoansPage);
