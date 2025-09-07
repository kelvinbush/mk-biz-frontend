import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabItems = [
  { value: "all", label: "All" },
  { value: "pending", label: "In Progress" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "disbursed", label: "Disbursed" },
];

interface StatusTabsProps {
  setActiveTab: (value: string) => void;
}

export const StatusTabs: React.FC<StatusTabsProps> = ({ setActiveTab }) => {
  const tabStyles =
    "border-b data-[state=active]:shadow-none py-3 px-3 border-gray-400 data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:text-primary-green data-[state=active]:border-b-2 data-[state=active]:border-primary-green rounded-none";

  return (
    <TabsList className="grid w-max grid-cols-5 bg-transparent mb-8">
      {tabItems.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={tabStyles}
          onClick={() => setActiveTab(tab.value)}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
