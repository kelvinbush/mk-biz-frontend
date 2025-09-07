"use client";

import { Toaster } from "@/components/ui/toaster";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import React from "react";
import { useAuth } from "@clerk/nextjs";

const SUPPORT_EMAIL = "support@melaninkapital.com";

const features = [
  {
    icon: <Icons.moneyIcon />,
    feature:
      "Unlock funding opportunities of KES 10M+, spanning working capital, carbon credits, equity, and grants.",
  },
  {
    icon: <Icons.featureTwo />,
    feature:
      "Join our community of 200+ successful businesses across diverse industries that we've helped grow.",
  },
  {
    icon: <Icons.featureThree />,
    feature:
      "Access 50+ curated learning materials to refine your business structure for enhanced funding eligibility.",
  },
  {
    icon: <Icons.featureFour />,
    feature:
      "Gain access to financial, legal, marketing advice, and more from our team of 20+ qualified industry experts.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2 grid-cols-1">
        {/* Desktop left panel - hidden on mobile */}
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
                Start your financial readiness journey with us!
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

        {/* Right side content - full width on mobile */}
        <div className="flex flex-col h-full">
          {/* Mobile header - only visible on mobile */}
          <div className="lg:hidden w-full bg-gradient-to-r from-[#51EBEB] to-[#00CC99] py-6 px-4 flex justify-center">
            <img src="/img.png" alt="Melanin Kapital Logo" className="w-56" />
          </div>

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

          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-9 py-2 lg:py-6">
            <div className="flex flex-col lg:justify-center h-full mx-auto">
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
