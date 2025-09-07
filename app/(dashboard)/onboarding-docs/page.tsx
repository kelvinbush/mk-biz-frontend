'use client'
import React from "react";
import DocsUploadStepper from "@/components/onboarding-checklist/sole-prop/docs-upload.stepper";
import { withAuth } from "@/components/auth/RequireAuth";

const Page = () => {
  return <DocsUploadStepper />;
};

export default withAuth(Page);
