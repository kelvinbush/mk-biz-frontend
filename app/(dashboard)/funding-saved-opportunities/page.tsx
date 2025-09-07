"use client";
import FundingHeader from "@/components/funding/funding-header";
import React from "react";
import InvestorOpportunitiesSaved from "@/components/funding/investor-opportunities-saved";
import { withAuth } from "@/components/auth/RequireAuth";

const Page = () => {
  return (
    <div>
      <FundingHeader />
      <div className={"bg-white"}>
        <InvestorOpportunitiesSaved />
      </div>
    </div>
  );
};

export default withAuth(Page);
