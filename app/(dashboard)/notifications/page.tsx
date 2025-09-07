"use client";
import React from "react";
import { withAuth } from "@/components/auth/RequireAuth";

const Page = () => {
  return <div>Notifications Page</div>;
};

export default withAuth(Page);
