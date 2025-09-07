"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageRoutes } from "@/lib/constants/routes";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setTitle } from "@/lib/redux/features/top-bar.slice";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetBusinessProfileByPersonalGuidQuery } from "@/lib/redux/services/user";
import { Loader2 } from "lucide-react";
import BusinessProfileHeader from "./business-profile.header";
import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "Company Details",
    shortLabel: "Company",
    value: "company-details",
    path: PageRoutes.BUSINESS_PROFILE_COMPANY_DETAILS,
  },
  {
    label: "Company Documents",
    shortLabel: "Documents",
    value: "documents",
    path: PageRoutes.BUSINESS_PROFILE_COMPANY_DOCUMENTS,
  },
  // TODO: Uncomment when team members page is ready
  // {
  //   label: "Team Members",
  //   value: "team-members",
  //   path: PageRoutes.BUSINESS_PROFILE_TEAM_MEMBERS,
  // },
  {
    label: "Billing",
    shortLabel: "Billing",
    value: "billing",
    path: PageRoutes.BUSINESS_PROFILE_COMPANY_BILLING,
  },
];

interface BusinessProfileProps {
  children: React.ReactNode;
}

const BusinessProfile = ({ children }: BusinessProfileProps) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const guid = useAppSelector(selectCurrentToken);
  const { data: response, isLoading } =
    useGetBusinessProfileByPersonalGuidQuery(
      { guid: guid || "" },
      { skip: !guid },
    );

  dispatch(setTitle("Business Profile"));

  // Get the first part of the path after /business-profile/
  const currentMainTab = pathname.split("/").slice(2)[0] ?? "company-details";

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!response?.business) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load business profile</p>
      </div>
    );
  }

  const business = {
    name: response.business.businessName,
    isVerified: false,
    completion: 80,
    pitchDeckUrl: "https://google.com",
    imageUrl: response.business?.businessLogo || "",
    companyType: response.business.typeOfIncorporation,
    location: `${response.business.city}, ${response.business.country}`,
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <BusinessProfileHeader
        onImageUpload={() => console.log("Image Uploaded")}
        {...business}
      />
      <main className="space-y-4 md:space-y-6 bg-white">
        <div className="overflow-x-auto">
          <Tabs value={currentMainTab} className="w-full">
            <TabsList className="w-full min-w-[400px] bg-transparent grid grid-cols-3">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  asChild
                  className="border-b py-2 md:py-3 px-0 border-gray-400 data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:text-primary-green data-[state=active]:border-b-2 data-[state=active]:border-primary-green rounded-none text-xs md:text-base"
                >
                  <Link
                    href={tab.path}
                    className={cn(currentMainTab === tab.value && "font-medium")}
                  >
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="inline md:hidden">{tab.shortLabel}</span>
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="px-4 md:px-0">{children}</div>
      </main>
    </div>
  );
};

export default BusinessProfile;
