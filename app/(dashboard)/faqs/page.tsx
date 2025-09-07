"use client";
import React from "react";
import { withAuth } from "@/components/auth/RequireAuth";

const Page = () => {
  return <div>Faqs Page</div>;
};

export default withAuth(Page);
