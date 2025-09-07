"use client";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardOpportunities from "@/components/dashboard/dashboard-opportunities";
import { setTitle } from "@/lib/redux/features/top-bar.slice";
import { useAppDispatch } from "@/lib/redux/hooks";

function Home() {
  const dispatch = useAppDispatch();

  dispatch(setTitle("Dashboard"));

  return (
    <div className="space-y-4 md:space-y-6">
      <DashboardHeader />
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <DashboardOpportunities />
      </div>
    </div>
  );
}

export default Home;
