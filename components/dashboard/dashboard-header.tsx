import React from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetUserQuery } from "@/lib/redux/services/user";
import { useCompletionPercentage } from "@/hooks/use-completion-percentage";
import { Skeleton } from "@/components/ui/skeleton";

type FundingHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const DashboardHeader = ({ className, ...props }: FundingHeaderProps) => {
  const guid = useAppSelector(selectCurrentToken);

  const { data: user, isLoading: userIsLoading } = useGetUserQuery(
    { guid: guid! },
    { skip: !guid },
  );

  const getSalutation = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.personal?.firstName || "";
  const { completionPercentage } = useCompletionPercentage();

  const backgroundStyle = React.useMemo(
    () => ({
      backgroundImage: "url(/images/abstract3.png)",
      backgroundPosition: "center",
      backgroundSize: "cover",
    }),
    [],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-gradient-to-r from-gray-900/90 to-gray-900/70",
        className,
      )}
      {...props}
      style={backgroundStyle}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(21, 31, 40, 0.5)",
        }}
      />
      <div className="flex relative flex-col md:flex-row items-center py-6 px-4 md:py-8 md:px-10 text-white">
        <div className="flex-1 space-y-2 text-center md:text-left mb-6 md:mb-0">
          {userIsLoading ? (
            <>
              <Skeleton className="h-10 w-64 bg-gray-700/50" />
              <Skeleton className="h-8 w-96 bg-gray-700/50" />
              <Skeleton className="h-6 w-[500px] bg-gray-700/50" />
            </>
          ) : (
            <>
              <h1 className="font-bold text-2xl md:text-3xl">
                {getSalutation()},{" "}
                <span className="text-primary-green">{firstName}</span>
              </h1>
              <p className="font-medium text-xl md:text-2xl">
                {completionPercentage === 100
                  ? "Congratulations on completing your onboarding checklist! 🎉"
                  : completionPercentage >= 80
                  ? "Congratulations on reaching this milestone! 🎉"
                  : completionPercentage >= 60
                  ? "You're making great progress! 🎉"
                  : "You're off to a great start 🎉"}
              </p>
              <p className="font-medium text-base md:text-xl">
                {completionPercentage === 100
                  ? "You've unlocked full access to Melanin Kapital loans. Explore available options and apply now!"
                  : completionPercentage >= 80
                  ? "You've unlocked access  to our Working Capital Financing—apply now to fuel your business growth."
                  : completionPercentage >= 60
                  ? "Complete at least 80% of your onboarding to unlock access to apply for a loan and get verified faster."
                  : "Complete your onboarding checklist to get verified faster, and unlock quicker access to funding."}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 md:pl-8 md:border-l">
          {userIsLoading ? (
            <>
              <div className="h-28 w-28">
                <Skeleton className="h-full w-full rounded-full bg-gray-700/50" />
              </div>
              <Skeleton className="h-9 w-full rounded-md bg-gray-700/50" />
            </>
          ) : (
            <>
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-white"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                  />
                  <circle
                    className="stroke-[#F0459C]"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(2 * Math.PI * 45 * completionPercentage) / 100} ${2 * Math.PI * 45}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-white">
                  <span className="text-2xl font-bold">
                    {completionPercentage}%
                  </span>
                  <span className="text-sm">Complete</span>
                </div>
              </div>
              {completionPercentage >= 80 ? (
                <a href="/funding" className="w-full">
                  <button className="w-full rounded-md bg-primary-green px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 focus:outline-none">
                    View Loan Options
                  </button>
                </a>
              ) : (
                <a href="/onboarding-checklist" className="w-full">
                  <button className="w-full rounded-md bg-primary-green px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 focus:outline-none">
                    Complete Checklist
                  </button>
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DashboardHeader);
