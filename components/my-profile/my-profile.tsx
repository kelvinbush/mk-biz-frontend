"use client";
import { Camera, Mail, Phone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  useGetUserQuery,
  useUpdateUserProfileMutation,
} from "@/lib/redux/services/user";
import { setTitle } from "@/lib/redux/features/top-bar.slice";
import { usePathname, useRouter } from "next/navigation";
import { UploadPhotoModal } from "@/components/my-profile/components/upload-photo-modal";
import { Separator } from "@/components/ui/separator";

const tabs = [
  {
    label: "Personal Information",
    value: "personal-info",
    path: "/my-profile/personal-info",
    shortLabel: "Personal", // Short label for mobile
  },
  {
    label: "Personal Documents",
    value: "documents",
    path: "/my-profile/documents",
    shortLabel: "Documents", // Short label for mobile
  },
  {
    label: "Password & Security",
    value: "password-security",
    path: "/my-profile/password-security",
    shortLabel: "Security", // Short label for mobile
  },
];

interface MyProfileProps {
  children: React.ReactNode;
}

export default function MyProfile({ children }: MyProfileProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [activeTab, setActiveTab] = useState("personal-info");

  useEffect(() => {
    const currentPath = pathname.split("/").pop();
    if (currentPath && tabs.some((tab) => tab.value === currentPath)) {
      setActiveTab(currentPath);
    }
  }, [pathname]);

  dispatch(setTitle("My Profile"));

  const userId = useAppSelector(selectCurrentToken);
  const {
    data: user,
    error: userError,
    isLoading: userIsLoading,
  } = useGetUserQuery({ guid: userId! });

  // const { data: response } = useGetBusinessProfileByPersonalGuidQuery(
  //   { guid: userId || "" },
  //   { skip: !userId },
  // );

  if (userError) {
    return <div>Error loading user data</div>;
  }

  const handlePhotoUploadComplete = async (url: string) => {
    if (!user || !userId) return;

    try {
      await updateUserProfile({
        guid: userId,
        profile: {
          ...user.personal,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          profilePhoto: url,
        },
      });
      setIsPhotoModalOpen(false);
    } catch (error) {
      console.error("Failed to update profile photo:", error);
    }
  };

  //
  // const isBusinessOwner = response?.business.isBeneficalOwner;
  //
  // if (!isBusinessOwner) {
  //   tabs = [tabs[0], tabs[tabs.length - 1]];
  // }

  const handleTabChange = (value: string) => {
    const tab = tabs.find((t) => t.value === value);
    if (tab) {
      setActiveTab(value);
      router.push(tab.path);
    }
  };

  return (
    <div className="rounded bg-white shadow">
      <div
        className="relative h-32 md:h-48 rounded-t"
        style={{
          background:
            "linear-gradient(92.45deg, rgba(21, 31, 40, 0.8) 28.67%, rgba(84, 221, 187, 0.8) 100%)",
        }}
      ></div>
      <div className="px-4 md:px-8 pb-6 md:pb-8 relative">
        <div className="-mt-14 md:mb-8">
          {userIsLoading ? (
            <Skeleton className="h-24 w-24 md:h-28 md:w-28 rounded-full" />
          ) : (
            <div className="relative w-max">
              <img
                src={
                  user?.personal.profilePhoto ||
                  "https://www.shutterstock.com/image-vector/user-icon-vector-illustration-logo-600nw-1647178156.jpg"
                }
                alt="Profile"
                className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-white object-cover"
              />
              <div
                className="absolute bottom-0 right-0 grid h-7 w-7 md:h-8 md:w-8 cursor-pointer place-items-center rounded-full border-2 border-white bg-[rgb(84,221,187)]"
                onClick={() => setIsPhotoModalOpen(true)}
              >
                <Camera className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
            </div>
          )}
          <div className="mt-4 md:mt-0 md:ml-6">
            {userIsLoading ? (
              <>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-3xl font-medium">
                  {user?.personal.firstName} {user?.personal.lastName}
                </h1>
                <div className="mt-2 md:mt-3 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-sm md:text-base text-[#62696F]">
                  <span className="flex items-center">
                    <Mail className="mr-1 h-4 w-4" />
                    {user?.personal.email}
                  </span>
                  <Separator
                    orientation="vertical"
                    className="hidden md:block h-7 w-0.5 bg-black"
                  />
                  <span className="flex items-center">
                    <Phone className="mr-1 h-4 w-4" />
                    {user?.personal.county} {user?.personal.phoneNumber}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full md:w-max grid-cols-3 bg-transparent overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="border-b data-[state=active]:shadow-none py-2 md:py-3 px-1 md:px-3 border-gray-400 data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:text-primary-green data-[state=active]:border-b-2 data-[state=active]:border-primary-green rounded-none text-xs md:text-sm whitespace-nowrap"
              >
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-4 md:mt-6">{children}</div>
        </Tabs>
      </div>

      <UploadPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUploadComplete={handlePhotoUploadComplete}
      />
    </div>
  );
}
