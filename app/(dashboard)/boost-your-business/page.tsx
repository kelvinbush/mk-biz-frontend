"use client";
import React from "react";
import { withAuth } from "@/components/auth/RequireAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Page = () => {
  const router = useRouter();

  // Memoize the background style to prevent unnecessary re-renders
  const backgroundStyle = React.useMemo(
    () => ({
      backgroundImage: "url(/images/abstract.png)",
      backgroundPosition: "center",
      backgroundSize: "cover",
    }),
    [],
  );

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div
        className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-gray-900/90 to-gray-900/70 mx-4 md:mx-6 mt-4"
        style={backgroundStyle}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(21, 31, 40, 0.5)",
          }}
        />
        <div className="relative p-6 md:p-12 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Our Trusted Partners for Your Growth
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
            Explore our network of trusted partners offering specialized
            business solutions and services to help your business thrive.
          </p>
        </div>
      </div>

      {/* Partners Content */}
      <div className="p-4 md:p-6 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lawyered Up Card */}
          <div className="bg-white rounded-sm border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src="/images/law.svg"
                  alt="Law Icon"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-midnight-blue">
              Lawyered Up
            </h3>
            <p className="text-midnight-blue/70 text-sm mb-6 leading-relaxed">
              AI-powered legal workspace automating the full contract lifecycle,
              making legal processes faster, more affordable, and accessible for
              businesses.
            </p>
            <button
              onClick={() => router.push("/boost-your-business/lawyered-up")}
              className="w-full py-2 px-4 border border-primary rounded-sm text-midnight-blue font-medium hover:bg-gray-50 transition-colors"
            >
              View Services
            </button>
          </div>

          {/* Workpay Card */}
          <div className="bg-white rounded-sm border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src="/images/work.svg"
                  alt="Work Icon"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-midnight-blue">
              Workpay
            </h3>
            <p className="text-midnight-blue/70 text-sm mb-6 leading-relaxed">
              The Global HR & Payroll solution for startups, SMBs, and HR
              professionals, offering effortless payroll, EOR, and compliance
              across Africa.
            </p>
            <button className="w-full py-2 px-4 border border-primary rounded-sm text-midnight-blue font-medium hover:bg-gray-50 transition-colors">
              View Services
            </button>
          </div>

          {/* More Partners Coming Soon Card */}
          <div className="bg-white rounded-sm border p-6 shadow-sm border-dashed border-gray-300">
            <div className="text-center">
              <div className="w-28 h-28 flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/images/pencil.gif"
                  alt="Pencil Animation"
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-midnight-blue mb-3">
                More Partners Coming Soon!
              </h3>
              <p className="text-midnight-blue/70 text-sm leading-relaxed">
                Stay tuned—we&apos;re constantly expanding our network to bring
                you the best business solutions and services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Page);
