import { Button } from "@/components/ui/button";
import { Check, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { setTitle } from "@/lib/redux/features/top-bar.slice";
import { useGetUserQuery } from "@/lib/redux/services/user";
import Link from "next/link";
import { useCompletionPercentage } from "@/hooks/use-completion-percentage";
import CompletionModal from "@/components/onboarding-checklist/CompletionModal";

// Component to render a checklist step
type StepProps = {
  number: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
  buttonText: string;
  buttonLink: string;
};

const ChecklistStep = ({
  number,
  title,
  description,
  isComplete,
  isActive,
  buttonText,
  buttonLink,
}: StepProps) => {
  const getBackgroundColor = () => {
    if (isComplete) return "bg-white";
    if (isActive) return "bg-primary-green bg-opacity-10";
    return "bg-white";
  };

  const getIconBackgroundColor = () => {
    if (isComplete) return "bg-primary-green";
    if (isActive) return "bg-primary-green";
    return "bg-gray-300";
  };

  const getButtonStyle = () => {
    if (isComplete) {
      return {
        variant: "outline" as const,
        className: "rounded-sm border-primary-green text-primary-green",
      };
    }

    if (isActive) {
      return {
        variant: "default" as const,
        className: "rounded-sm bg-primary-green text-white",
      };
    }

    return {
      variant: "outline" as const,
      className: "rounded-sm border-primary-green text-primary-green",
    };
  };

  const buttonStyle = getButtonStyle();

  return (
    <div
      className={`flex flex-col sm:flex-row sm:justify-between rounded-lg ${getBackgroundColor()} px-3 sm:px-4 py-4 sm:py-6 shadow gap-3`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`flex items-center justify-center rounded-full ${getIconBackgroundColor()} p-2 text-white shrink-0`}
        >
          {isComplete ? (
            <Check size={20} />
          ) : (
            <div className="px-[7px]">{number}</div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-base sm:text-lg">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <Link
        href={buttonLink}
        className="self-start sm:self-center mt-2 sm:mt-0"
      >
        <Button
          variant={buttonStyle.variant}
          className={`${buttonStyle.className} text-sm`}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};

const Checklist = () => {
  const dispatch = useAppDispatch();
  const guid = useAppSelector(selectCurrentToken);

  dispatch(setTitle("Onboarding Checklist"));

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
  const {
    completionPercentage,
    isComplete: isOnboardingComplete,
    isBusinessProfileComplete,
    isDocumentsComplete,
  } = useCompletionPercentage();

  return (
    <>
      {/* Persistent completion modal */}
      <CompletionModal open={completionPercentage === 100} proceedHref="/" />
      <div className="min-h-[90svh] grid grid-cols-1 gap-4">
        <div
          className={
            "space-y-1 py-4 sm:py-6 bg-white items-start col-span-1 lg:col-span-2"
          }
        >
          <div className="space-y-2 px-3 sm:px-6">
            {userIsLoading ? (
              <Skeleton className="h-8 sm:h-12 w-48 sm:w-64" />
            ) : (
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                {getSalutation()},{" "}
                <span className="text-primary-green">{firstName}</span>
              </h1>
            )}
            {isOnboardingComplete ? (
              <Alert className="bg-green-50 border-green-200 mt-2 sm:mt-4">
                <PartyPopper className="h-4 sm:h-5 w-4 sm:w-5 text-green-600" />
                <AlertTitle className="text-green-800 text-sm sm:text-base">
                  Congratulations!
                </AlertTitle>
                <AlertDescription className="text-green-700 text-xs sm:text-sm">
                  You have successfully completed your business onboarding. All
                  required documents have been uploaded.
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-midnight-blue text-base sm:text-lg md:text-xl font-medium">
                Welcome to Melanin Kapital! Complete all the steps to boost your
                capital-readiness today! 🎉
              </p>
            )}
          </div>

          <div>
            <p
              className={
                "pr-3 sm:pr-6 text-right text-xs sm:text-sm text-midnight-blue"
              }
            >
              {completionPercentage}%
            </p>
            <div className={"px-3 sm:px-6"}>
              <Progress
                value={completionPercentage}
                className="h-1.5 w-full bg-gray-200"
                indicatorClassName="bg-pink-500"
              />
            </div>
            <Separator className={"my-3 sm:my-4"} />
          </div>

          <div className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            {/* Personal Profile Section */}
            <ChecklistStep
              number={1}
              title="Create your personal profile"
              description="Fill in your personal details to create a comprehensive profile for identification and communication."
              isComplete={true} // Personal profile is always complete at this stage
              isActive={false}
              buttonText="View"
              buttonLink="/my-profile"
            />

            {/* Business Profile Section */}
            <ChecklistStep
              number={2}
              title="Complete your business profile"
              description="Provide key business details to establish your business identity and background for funding assessment."
              isComplete={isBusinessProfileComplete}
              isActive={!isBusinessProfileComplete}
              buttonText={isBusinessProfileComplete ? "View" : "Continue"}
              buttonLink="/onboarding-business"
            />

            {/* Documents Section */}
            <ChecklistStep
              number={3}
              title="Upload documents"
              description="Upload required business documents for verification to confirm your business's eligibility for funding."
              isComplete={isDocumentsComplete}
              isActive={isBusinessProfileComplete && !isDocumentsComplete}
              buttonText={isDocumentsComplete ? "View" : "Continue"}
              buttonLink="/onboarding-docs"
            />
          </div>
        </div>
        {/*<div className="grid grid-cols-1 items-start gap-4 sm:gap-6 py-4 sm:py-6 px-3 sm:px-6 bg-white">*/}
        {/*  <div className="rounded-lg p-3 sm:p-4">*/}
        {/*    <div className="mb-4 sm:mb-6 flex items-center gap-2 font-semibold">*/}
        {/*      <Icons.needHelp className="h-4 w-4 shrink-0" />*/}
        {/*      <p className="text-sm sm:text-base">Frequently asked questions</p>*/}
        {/*    </div>*/}
        {/*    <div className="">*/}
        {/*      <div className="flex cursor-pointer items-center justify-between">*/}
        {/*        <p className="text-xs sm:text-sm font-medium">*/}
        {/*          What should I do if I don&apos;t have all the required*/}
        {/*          documents?*/}
        {/*        </p>*/}
        {/*        <ChevronDown className="h-3 sm:h-4 w-3 sm:w-4" />*/}
        {/*      </div>*/}
        {/*      <Separator className={"my-3 sm:my-4 bg-[#93989C]"} />*/}
        {/*      <p className={"text-xs sm:text-sm md:text-base font-normal"}>*/}
        {/*        You can invite team members to assist with gathering the*/}
        {/*        necessary documents or reach out to our support team for*/}
        {/*        guidance.*/}
        {/*      </p>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </>
  );
};

export default Checklist;
