"use client";
import React from "react";
import { Suspense } from "react";
import PasswordReset from "@/components/auth/password-reset";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full max-w-4xl mx-auto">
        <PasswordReset />
      </div>
    </Suspense>
  );
};

export default Page;
