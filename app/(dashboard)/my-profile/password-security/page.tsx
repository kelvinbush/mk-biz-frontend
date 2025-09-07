import React from "react";
import PasswordSecurity from "@/components/my-profile/components/password-security";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password & Security - Melanin Kapital",
  description: "Manage your password and security",
};

const Page = () => {
  return <PasswordSecurity />;
};

export default Page;
