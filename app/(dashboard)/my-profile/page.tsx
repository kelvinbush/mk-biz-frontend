"use client";
import { redirect } from "next/navigation";
import { withAuth } from "@/components/auth/RequireAuth";

const Page = () => {
  redirect("/my-profile/personal-info");
  return (
    <div>
      <h1>Page</h1>
    </div>
  );
};

export default withAuth(Page);
