'use client'
import React from "react";
import MyProfile from "@/components/my-profile/my-profile";
import { withAuth } from "@/components/auth/RequireAuth";


const MyProfileLayout = ({ children }: { children: React.ReactNode }) => (
  <MyProfile>{children}</MyProfile>
);

export default withAuth(MyProfileLayout);
