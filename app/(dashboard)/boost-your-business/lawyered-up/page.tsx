"use client";
import React, { useState } from "react";
import { withAuth } from "@/components/auth/RequireAuth";
import { ArrowLeft, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  useGetBusinessProfileByPersonalGuidQuery,
  useGetUserQuery,
} from "@/lib/redux/services/user";
import { useToast } from "@/hooks/use-toast";

const LawyeredUpPage = () => {
  const router = useRouter();
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { toast } = useToast();
  const userGuid = useAppSelector(selectCurrentToken);

  const { data: userResp } = useGetUserQuery(
    { guid: userGuid || "" },
    { skip: !userGuid },
  );

  const { data: businessResp } = useGetBusinessProfileByPersonalGuidQuery(
    { guid: userGuid || "" },
    { skip: !userGuid },
  );

  const features = [
    {
      icon: "/images/plus.svg",
      title: "Intelligent Contract Creation",
      description:
        "Effortlessly draft customized contracts with Lawyered Up&apos;s intuitive document creator. Automate the process, reduce errors, and create agreements in minutes!",
    },
    {
      icon: "/images/pencil.svg",
      title: "Flexible Contract Editing",
      description:
        "Make instant changes to your contracts with an AI-powered, intuitive free-text editor. Edit, update, and adapt agreements anytime to fit your evolving business needs.",
    },
    {
      icon: '<svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.25 0.46875H9.5V5.46875C9.5 6.17188 10.0469 6.71875 10.75 6.71875H15.75V17.9688C15.75 19.375 14.6172 20.4688 13.25 20.4688H3.25C1.84375 20.4688 0.75 19.375 0.75 17.9688V2.96875C0.75 1.60156 1.84375 0.46875 3.25 0.46875ZM10.75 0.46875L15.75 5.46875H10.75V0.46875ZM12.6641 11.4453H12.625C13.0156 11.0938 13.0156 10.5078 12.625 10.1172C12.2734 9.76562 11.6875 9.76562 11.3359 10.1172L6.96094 14.4922L5.125 12.6562C4.77344 12.2656 4.1875 12.2656 3.83594 12.6562C3.44531 13.0078 3.44531 13.5938 3.83594 13.9453L6.33594 16.4453C6.6875 16.8359 7.27344 16.8359 7.66406 16.4453L12.6641 11.4453Z" fill="#00CC99"/></svg>',
      title: "Vetted Contract Templates",
      description:
        "Save time with an extensive library of country-specific, vetted contract templates. Ensure compliance and accuracy while eliminating the need to start from scratch.",
    },
    {
      icon: '<svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.75 0.46875H9V5.46875C9 6.17188 9.54688 6.71875 10.25 6.71875H15.25V8.4375L11.5391 12.1484C11.2266 12.4609 10.9922 12.8516 10.875 13.3203L10.2891 15.6641C10.2109 16.0156 10.2109 16.4062 10.3281 16.7188H9.97656L9.82031 16.4062C9.54688 15.8203 8.96094 15.4688 8.375 15.4688C7.98438 15.4688 7.59375 15.625 7.32031 15.8594L6.85156 14.375C6.73438 13.9062 6.30469 13.5938 5.875 13.5938C5.40625 13.5938 4.97656 13.9062 4.85938 14.375L4.27344 16.2891C4.19531 16.5625 3.96094 16.7188 3.6875 16.7188H3.375C3.02344 16.7188 2.75 17.0312 2.75 17.3438C2.75 17.6953 3.02344 17.9688 3.375 17.9688H3.6875C4.50781 17.9688 5.25 17.4609 5.48438 16.6406L5.875 15.3516L6.5 17.5391C6.57812 17.7734 6.8125 17.9688 7.04688 17.9688C7.32031 18.0078 7.55469 17.8906 7.67188 17.6562L8.02344 16.9531C8.0625 16.8359 8.21875 16.7188 8.375 16.7188C8.49219 16.7188 8.64844 16.8359 8.6875 16.9531L9.03906 17.6562C9.15625 17.8516 9.35156 17.9688 9.625 17.9688H12.125C12.125 17.9688 12.1641 17.9688 12.2031 17.9688C12.3203 17.9688 12.4375 17.9688 12.5547 17.9297L14.8984 17.3438C15.0156 17.3047 15.1328 17.2656 15.25 17.2266V17.9688C15.25 19.375 14.1172 20.4688 12.75 20.4688H2.75C1.34375 20.4688 0.25 19.375 0.25 17.9688V2.96875C0.25 1.60156 1.34375 0.46875 2.75 0.46875ZM10.25 0.46875L15.25 5.46875H10.25V0.46875ZM21.6953 5.9375L22.2812 6.52344C22.8672 7.10938 22.8672 8.125 22.2812 8.71094L21.1094 9.88281L18.3359 7.10938L19.5078 5.9375C20.0938 5.35156 21.1094 5.35156 21.6953 5.9375ZM12.3984 13.0078L17.4766 7.96875L20.25 10.7422L15.1719 15.7812C15.0156 15.9766 14.8203 16.0547 14.625 16.1328L12.2422 16.7188C12.0469 16.7578 11.8125 16.7188 11.6562 16.5625C11.5 16.4062 11.4609 16.1719 11.5 15.9375L12.0859 13.5938C12.125 13.3984 12.2422 13.2031 12.3984 13.0078Z" fill="#00CC99"/></svg>',
      title: "Seamless Contract Signing",
      description:
        "Experience fast, secure, and legally binding signing anytime, anywhere. Finalize contracts, close deals, and keep your business moving without the hassle of printing or scanning.",
    },
    {
      icon: '<svg width="15" height="21" viewBox="0 0 15 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 0.46875H8.75V5.46875C8.75 6.17188 9.29688 6.71875 10 6.71875H15V17.9688C15 19.375 13.8672 20.4688 12.5 20.4688H2.5C1.09375 20.4688 0 19.375 0 17.9688V2.96875C0 1.60156 1.09375 0.46875 2.5 0.46875ZM10 0.46875L15 5.46875H10V0.46875ZM3.125 2.96875C2.77344 2.96875 2.5 3.28125 2.5 3.59375C2.5 3.94531 2.77344 4.21875 3.125 4.21875H5.625C5.9375 4.21875 6.25 3.94531 6.25 3.59375C6.25 3.28125 5.9375 2.96875 5.625 2.96875H3.125ZM3.125 5.46875C2.77344 5.46875 2.5 5.78125 2.5 6.09375C2.5 6.44531 2.77344 6.71875 3.125 6.71875H5.625C5.9375 6.71875 6.25 6.44531 6.25 6.09375C6.25 5.78125 5.9375 5.46875 5.625 5.46875H3.125ZM5.23438 15.3906L5.625 14.1016L6.25 16.2891C6.32812 16.5234 6.5625 16.7188 6.79688 16.7188C7.07031 16.7578 7.30469 16.6406 7.42188 16.4062L7.77344 15.7031C7.8125 15.5859 7.96875 15.4688 8.125 15.4688C8.24219 15.4688 8.39844 15.5859 8.4375 15.7031L8.78906 16.4062C8.90625 16.6016 9.10156 16.7188 9.375 16.7188H11.875C12.1875 16.7188 12.5 16.4453 12.5 16.0938C12.5 15.7812 12.1875 15.4688 11.875 15.4688H9.72656L9.57031 15.1562C9.29688 14.5703 8.71094 14.2188 8.125 14.2188C7.73438 14.2188 7.34375 14.375 7.07031 14.6094L6.60156 13.125C6.48438 12.6562 6.05469 12.3438 5.625 12.3438C5.15625 12.3438 4.72656 12.6562 4.60938 13.125L4.02344 15.0391C3.94531 15.3125 3.71094 15.4688 3.4375 15.4688H3.125C2.77344 15.4688 2.5 15.7812 2.5 16.0938C2.5 16.4453 2.77344 16.7188 3.125 16.7188H3.4375C4.25781 16.7188 5 16.2109 5.23438 15.3906Z" fill="#00CC99"/></svg>',
      title: "Efficient Contract Management",
      description:
        "Track and efficiently manage all your contracts effortlessly across multiple key stages. Share agreements securely with internal and external stakeholders anytime.",
    },
    {
      icon: '<svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.4375 0.992188C6.82812 1.34375 6.82812 1.92969 6.47656 2.32031L3.66406 5.44531C3.50781 5.60156 3.27344 5.71875 3 5.71875C2.76562 5.75781 2.49219 5.64062 2.33594 5.44531L0.773438 3.88281C0.382812 3.53125 0.382812 2.94531 0.773438 2.55469C1.125 2.20312 1.71094 2.20312 2.0625 2.55469L2.96094 3.45312L5.10938 1.03125C5.46094 0.640625 6.04688 0.640625 6.4375 0.992188ZM6.4375 7.24219C6.82812 7.59375 6.82812 8.17969 6.47656 8.57031L3.66406 11.6953C3.50781 11.8516 3.27344 11.9688 3 11.9688C2.76562 12.0078 2.49219 11.8906 2.33594 11.6953L0.773438 10.1328C0.382812 9.78125 0.382812 9.19531 0.773438 8.84375C1.125 8.45312 1.71094 8.45312 2.0625 8.84375L2.96094 9.70312L5.10938 7.28125C5.46094 6.92969 6.04688 6.89062 6.4375 7.24219ZM9.25 3.21875C9.25 2.55469 9.79688 1.96875 10.5 1.96875H19.25C19.9141 1.96875 20.5 2.55469 20.5 3.21875C20.5 3.92188 19.9141 4.46875 19.25 4.46875H10.5C9.79688 4.46875 9.25 3.92188 9.25 3.21875ZM9.25 9.46875C9.25 8.80469 9.79688 8.21875 10.5 8.21875H19.25C19.9141 8.21875 20.5 8.80469 20.5 9.46875C20.5 10.1719 19.9141 10.7188 19.25 10.7188H10.5C9.79688 10.7188 9.25 10.1719 9.25 9.46875ZM6.75 15.7188C6.75 15.0547 7.29688 14.4688 8 14.4688H19.25C19.9141 14.4688 20.5 15.0547 20.5 15.7188C20.5 16.4219 19.9141 16.9688 19.25 16.9688H8C7.29688 16.9688 6.75 16.4219 6.75 15.7188ZM2.375 13.8438C3.03906 13.8438 3.625 14.2344 3.97656 14.7812C4.32812 15.3672 4.32812 16.1094 3.97656 16.6562C3.625 17.2422 3.03906 17.5938 2.375 17.5938C1.67188 17.5938 1.08594 17.2422 0.734375 16.6562C0.382812 16.1094 0.382812 15.3672 0.734375 14.7812C1.08594 14.2344 1.67188 13.8438 2.375 13.8438Z" fill="#00CC99"/></svg>',
      title: "Smart Task Management",
      description:
        "Never miss a deadline with real-time oversight of all your company obligations. Streamline tasks from HR filings to contract renewals and stay on top of every responsibility effortlessly.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header with Back Navigation */}
      <div className="flex items-center px-4 md:px-6 pb-4 gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-midnight-blue hover:text-midnight-blue/80 transition-colors hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium text-midnight-blue">
            Boost Your Business
          </span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">•</span>
          <span className="text-sm font-medium text-primary-green">
            Lawyered Up
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-8 bg-white">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-left mb-4">
            <h1 className="text-3xl md:text-4xl font-normal text-midnight-blue mb-2">
              Smarter legal workflows – simple, fast, automated
            </h1>
            <div className="flex items-center gap-2 text-lg">
              <span className="text-midnight-blue">Enjoy an exclusive</span>
              <span className="bg-[#0C9] text-white px-3 py-[1px] rounded-md font-medium">
                10% discount
              </span>
              <span className="text-midnight-blue">
                across all Lawyered Up plans
              </span>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-midnight-blue rounded-lg mb-12 relative overflow-hidden w-full">
            {!isVideoPlaying ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-white">
                  <div
                    className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    See Lawyered Up in Action
                  </h3>
                  <p className="text-white/80 max-w-md mx-auto">
                    Discover how Lawyered Up empowers teams to create, manage,
                    and finalize contracts with speed and confidence.
                  </p>
                </div>
              </div>
            ) : (
              <video
                className="w-full h-auto"
                controls
                autoPlay
                preload="metadata"
                style={{ aspectRatio: "16/9" }}
              >
                <source
                  src="https://files.edgestore.dev/bqiq1ldogyqmeec4/publicFiles/_public/0d53baa1-a571-4be6-b301-97f69ce285c6.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Features Carousel Section */}
          <div className="relative mb-12">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="p-2 rounded-full bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-midnight-blue" />
              </button>

              <div className="overflow-hidden flex-1">
                <div
                  className="flex transition-transform duration-300 ease-in-out gap-6"
                  style={{
                    transform: `translateX(-${currentSlide * 33.333}%)`,
                  }}
                >
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="min-w-[calc(33.333%-1rem)] text-left bg-white rounded-lg border p-6 shadow"
                    >
                      <div
                        className="w-10 h-10 rounded-lg shadow-sm flex items-center justify-center mb-4"
                        style={{ backgroundColor: "#E6FAF5" }}
                      >
                        {feature.icon.startsWith("/") ? (
                          <Image
                            src={feature.icon}
                            alt={feature.title}
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{ __html: feature.icon }}
                          />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-midnight-blue mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-midnight-blue/70 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  setCurrentSlide(
                    Math.min(features.length - 3, currentSlide + 1),
                  )
                }
                disabled={currentSlide >= features.length - 3}
                className="p-2 rounded-full bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-midnight-blue" />
              </button>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-midnight-blue mb-6">
              Ready to unlock these benefits?
            </h2>
            <button
              onClick={() => setShowGetStartedModal(true)}
              className="bg-primary-green hover:bg-primary-green/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Get Started Modal */}
      <Dialog open={showGetStartedModal} onOpenChange={setShowGetStartedModal}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader className="sm:text-center">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src="/magic-wand.svg"
                  alt="Magic Wand"
                  width={48}
                  height={48}
                  className="text-primary-green"
                />
              </div>
            </div>
            <div className="text-4xl font-medium">
              We&apos;ve Made It Simple!
            </div>
            <div
              className="text-center text-xl mt-10 text-[#62696F]"
              style={{
                marginTop: "50px",
                marginBottom: "20px",
              }}
            >
              You don&apos;t need to create a new account. Use your Melanin
              Kapital credentials to log in instantly, explore Lawyered Up, and
              claim 10% off any plan.
            </div>
          </DialogHeader>
          <div className="flex justify-center mt-4 gap-8 items-center">
            <Button
              onClick={() => setShowGetStartedModal(false)}
              size={"lg"}
              variant={"outline"}
              className="bg-white text-black border-gray-300 hover:bg-gray-50 px-9"
            >
              Check Back Later
            </Button>
            <Button
              onClick={async () => {
                // Validate required fields
                const personal = userResp?.personal;
                const business = businessResp?.business;

                const payload = {
                  userId: personal?.guid || userGuid || "",
                  userName:
                    [personal?.firstName, personal?.lastName]
                      .filter(Boolean)
                      .join(" ") || "",
                  email: personal?.email || "",
                  companyName: business?.businessName || "",
                  companyId: business?.businessGuid || "",
                  companyAddress:
                    [business?.street1, business?.street2, business?.city]
                      .filter(Boolean)
                      .join(", ") || "",
                  companyCountry: business?.country || "",
                  companyRcNumber: "", // optional field
                  companyBusiness: business?.businessDescription || "",
                  companyIndustry: business?.sector || "",
                };

                // Check required fields (all except companyRcNumber)
                const requiredFields = [
                  { field: "userId", label: "User ID" },
                  {
                    field: "userName",
                    label: "User Name",
                  },
                  { field: "email", label: "Email" },
                  {
                    field: "companyName",
                    label: "Company Name",
                  },
                  { field: "companyId", label: "Company ID" },
                  {
                    field: "companyAddress",
                    label: "Company Address",
                  },
                  { field: "companyCountry", label: "Company Country" },
                  {
                    field: "companyBusiness",
                    label: "Company Business Description",
                  },
                  { field: "companyIndustry", label: "Company Industry" },
                ];

                const missingFields = requiredFields.filter(
                  ({ field }) => !payload[field as keyof typeof payload],
                );

                if (missingFields.length > 0) {
                  const missingFieldNames = missingFields
                    .map(({ label }) => label)
                    .join(", ");
                  toast({
                    title: "Missing Required Information",
                    description: `Please complete your profile. Missing fields: ${missingFieldNames}`,
                    variant: "destructive",
                  });
                  return;
                }

                // All fields are valid, proceed with integration
                setGenerating(true);
                try {
                  const res = await fetch("/api/vega-sso", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(
                      err?.error || "Failed to generate SSO token",
                    );
                  }

                  const json = (await res.json()) as { url: string };
                  if (json?.url) {
                    window.location.href = json.url;
                  } else {
                    throw new Error("Invalid response from server");
                  }
                } catch (error) {
                  console.error(error);
                  toast({
                    title: "Integration Failed",
                    description:
                      error instanceof Error
                        ? error.message
                        : "Unexpected error occurred",
                    variant: "destructive",
                  });
                } finally {
                  setGenerating(false);
                }

                setShowGetStartedModal(false);
              }}
              size={"lg"}
              className="bg-black text-white hover:bg-gray-800 px-9"
              disabled={generating}
            >
              {generating ? "Connecting..." : "Log In & Get Discount"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAuth(LawyeredUpPage);
