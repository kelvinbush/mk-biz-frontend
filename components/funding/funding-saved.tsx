"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setTitle } from "@/lib/redux/features/top-bar.slice";
import FundingHeader from "./funding-header";

export default function FundingSaved({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setTitle("Saved Funding Opportunities"));
  }, [dispatch]);

  return (
    <section className="space-y-6">
      <FundingHeader />
      <main className="space-y-4 bg-white">
        <div className="p-6">{children}</div>
      </main>
    </section>
  );
}
