"use client";
import React from "react";
import BusinessProfileStepper from "@/components/onboarding-checklist/business-profile/business-profile-stepper";
import { withAuth } from "@/components/auth/RequireAuth";

const Page = () => <BusinessProfileStepper />

export default withAuth(Page);
