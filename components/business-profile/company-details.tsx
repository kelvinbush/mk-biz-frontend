"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { PageRoutes } from "@/lib/constants/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";

const navItems = [
  {
    label: "Company Information",
    shortLabel: "Information",
    value: "information",
    path: PageRoutes.BUSINESS_PROFILE_COMPANY_DETAILS_INFO,
    icon: Icons.businessProfileIcon,
  },
  {
    label: "Company Address",
    shortLabel: "Address",
    value: "address",
    path: PageRoutes.BUSINESS_PROFILE_COMPANY_DETAILS_ADDRESS,
    icon: MapPin,
  },
  {
    label: "Financial Details",
    shortLabel: "Financials",
    value: "financials",
    path: PageRoutes.BUSINESS_PROFILE_COMPANY_DETAILS_FINANCIALS,
    icon: Icons.funding,
  }
];

interface CompanyDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CompanyDetails = ({
  className,
  children,
  ...props
}: CompanyDetailsProps) => {
  const pathname = usePathname();
  const currentTab = pathname.split("/").pop() ?? "information";

  return (
    <div className={cn("flex flex-col md:flex-row h-full mt-2 md:mt-4", className)} {...props}>
      {/* Mobile horizontal navigation */}
      <div className="md:hidden overflow-x-auto pb-2 border-b">
        <div className="flex min-w-[500px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.value;

            return (
              <Button
                key={item.value}
                className={cn(
                  "flex-1 justify-center gap-1 h-10 bg-white text-black rounded-none shadow-none border-b-2 border-transparent hover:text-primary-green hover:border-primary-green/50 text-xs",
                  isActive && "border-b-2 border-primary-green text-primary-green font-medium"
                )}
                asChild
              >
                <Link href={item.path}>
                  <Icon className="h-3 w-3" />
                  {item.shortLabel}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Desktop sidebar navigation */}
      <div className="hidden md:block w-64 border-r bg-zinc-50/50 pr-0 mt-5">
        <nav className="w-full pl-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.value;

            return (
              <Button
                key={item.value}
                className={cn(
                  "w-full justify-start gap-2 h-12 bg-white text-black rounded-none shadow-none border hover:text-white",
                  isActive && "bg-midnight-blue text-white font-bold",
                )}
                asChild
              >
                <Link href={item.path}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-hidden p-4">{children}</div>
    </div>
  );
};

export default CompanyDetails;
