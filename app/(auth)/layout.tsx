"use client";

import { Toaster } from "@/components/ui/toaster";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SUPPORT_EMAIL = "support@melaninkapital.com";

const features = [
  {
    icon: <Icons.featureOne />,
    feature:
      "Gain access to a curated selection of funding opportunities perfectly suited to your business requirements.",
  },
  {
    icon: <Icons.featureTwo />,
    feature:
      "Connect with industry experts who are dedicated to unlocking the full potential of your business.",
  },
  {
    icon: <Icons.featureThree />,
    feature:
      "Explore a wealth of learning materials designed to help you structure your business for enhanced funding eligibility.",
  },
  {
    icon: <Icons.featureFour />,
    feature:
      "Join us at exclusive events tailored to help entrepreneurs like you expand your business network.",
  },
  {
    icon: <Icons.featureFive />,
    feature:
      "Assess your business's financial readiness through our market gap analysis service.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignUpRoute = pathname === "/sign-up";

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2 grid-cols-1 relative">
        <div
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) ), url(/bg.png)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className="flex flex-col items-center hidden lg:flex"
        >
          <p className="mr-auto flex items-center gap-2 pb-9 pl-6 pt-6 text-[22px] font-medium text-white">
            <img src="/img.png" alt="Melani Kapital Logo" className="w-72" />
          </p>
          <div className="grid flex-1 place-items-center p-9">
            <div className="w-full space-y-6 rounded-md border border-white/20 bg-white/5 p-9 text-center text-white backdrop-blur">
              <h1 className="mb-10 text-4xl font-bold text-left">
                Welcome to Melanin Kapital!
              </h1>
              <div className="space-y-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-x-8">
                    <div className="h-10 w-10 shrink-0">{feature.icon}</div>
                    <p className="text-left text-xl font-normal">
                      {feature.feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: "40px",
              background: "linear-gradient(90deg, #51EBEB 0%, #00CC99 100%)",
            }}
          ></div>
        </div>
        
        {/* Mobile header with logo */}
        <div className="lg:hidden flex justify-center py-6 bg-gradient-to-r from-[#51EBEB] to-[#00CC99]">
          <img src="/img.png" alt="Melani Kapital Logo" className="w-56" />
        </div>
        
        <div className="flex flex-col h-full w-full overflow-y-auto">
          {/* Desktop help button - only visible on desktop */}
          <div className="hidden lg:block absolute top-6 right-8 z-10">
            <Button
              variant="ghost"
              className="text-white flex items-center gap-1 text-lg font-bold"
              onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}
              title="Contact Support"
            >
              Need Help
              <Icons.needHelp className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Back button */}
          {!isSignUpRoute && (
            <div className="p-6">
              <Link href="/sign-in" passHref>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-sm font-medium text-midnight-blue hover:text-gray-900"
                  title="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col lg:justify-center h-full gap-2 px-4 sm:px-6 md:px-9 py-2 lg:py-4 font-medium text-midnight-blue">
              {children}
            </div>
          </div>
          
          {/* Mobile help button - only visible on mobile, positioned at bottom */}
          <div className="lg:hidden flex justify-end px-4 py-3 mt-auto border-t border-gray-100">
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-sm font-medium text-black"
              onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}
              title="Contact Support"
            >
              Need Help
              <Icons.needHelp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
