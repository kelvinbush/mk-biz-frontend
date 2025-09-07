"use client";
import React from "react";
import Checklist from "@/components/onboarding-checklist/checklist";
import { withAuth } from "@/components/auth/RequireAuth";

const Page = () => {
  return <Checklist />;
};

export default withAuth(Page);
