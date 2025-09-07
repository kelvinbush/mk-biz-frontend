"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageRoutes } from "@/lib/constants/routes";
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setTitle } from "@/lib/redux/features/top-bar.slice";
import FundingHeader from "./funding-header";
import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Green Financing by Melanin Kapital",
    value: "melaninkapital-loans",
    path: PageRoutes.FUNDING_MELANINKAPITAL_LOANS,
  },
  {
    label: "Investor Opportunities",
    value: "investor-opportunities",
    path: PageRoutes.FUNDING_INVESTOR_OPPORTUNITIES,
  },
];

export default function Funding({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    dispatch(setTitle("Funding Opportunities"));
  }, [dispatch]);

  // Get the first part of the path after /funding/
  const currentMainTab =
    pathname.split("/").slice(2)[0] ?? "investor-opportunities";

  return (
    <section className="space-y-4 md:space-y-6">
      <FundingHeader />
      <main className="space-y-2 md:space-y-4 bg-white">
        <Tabs value={currentMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="border-b data-[state=active]:shadow-none py-2 md:py-3 px-2 md:px-3 border-gray-400 data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:text-primary-green data-[state=active]:border-b-2 data-[state=active]:border-primary-green rounded-none text-xs md:text-sm whitespace-normal md:whitespace-nowrap"
                asChild
              >
                <Link
                  className={cn(currentMainTab === tab.value && "font-medium")}
                  href={tab.path}
                >
                  {tab.label}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="p-3 md:p-6">{children}</div>
      </main>
    </section>
  );
}
