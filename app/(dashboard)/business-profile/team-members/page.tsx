"use client";
import { Suspense } from "react";
import TeamMembers from "@/components/business-profile/team-members";
import { withAuth } from "@/components/auth/RequireAuth";

function TeamMembersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamMembers />
    </Suspense>
  );
}

export default withAuth(TeamMembersPage);
