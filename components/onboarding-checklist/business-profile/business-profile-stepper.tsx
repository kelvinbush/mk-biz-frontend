import { useState } from "react";
import BusinessRegistrationForm from "./forms/business-info";
import { Skeleton } from "@/components/ui/skeleton";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useAppSelector } from "@/lib/redux/hooks";
import { useGetBusinessProfileByPersonalGuidQuery } from "@/lib/redux/services/user";
import CompanyAddress from "./forms/company-address";
import FinancialDetails from "./forms/financial-details";
import MultiStepBusinessForm from "./multi-step.form";
import { useRouter } from "next/navigation";
import { Confetti } from "@/components/ui/confetti";
import { useCompletionPercentage } from "@/hooks/use-completion-percentage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BusinessProfileStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const userId = useAppSelector(selectCurrentToken);
  const { isLoading } = useGetBusinessProfileByPersonalGuidQuery(
    { guid: userId || "" },
    { skip: !userId },
  );
  const router = useRouter();
  const { completionPercentage } = useCompletionPercentage();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const onComplete = () => {
    if (completionPercentage === 100) {
      setShowCongrats(true);
    } else {
      router.push("/onboarding-checklist");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const navigateToDashboard = () => {
    router.push("/");
  };

  const steps = [
    {
      title: "Business Information",
      description: "Review and confirm the company details provided",
      content: <BusinessRegistrationForm onNext={handleNext} />,
    },
    {
      title: "Company Address",
      description:
        "Provide accurate company location details for official correspondence",
      content: (
        <CompanyAddress onNext={handleNext} onPrevious={handlePrevious} />
      ),
    },
    {
      title: "Company financial details",
      description:
        "Provide key financial information to help assess your business's financial health and funding needs.",
      content: (
        <FinancialDetails onNext={onComplete} onPrevious={handlePrevious} />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="mt-2 sm:mt-3 max-w-7xl space-y-4 sm:space-y-8 px-2 sm:px-0">
        <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
        <div className="space-y-4 sm:space-y-8 rounded-lg bg-white p-4 sm:p-8 shadow-md">
          <div className="space-y-3 sm:space-y-4">
            <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" />
            <Skeleton className="h-8 sm:h-10 w-full sm:w-3/4" />
            <Skeleton className="h-6 sm:h-8 w-full sm:w-1/2" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <Skeleton className="h-10 sm:h-12 w-full" />
            <Skeleton className="h-10 sm:h-12 w-full" />
            <Skeleton className="h-10 sm:h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <MultiStepBusinessForm
        currentStep={currentStep}
        steps={steps}
        setCurrentStep={setCurrentStep}
      />
      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent
          className="sm:max-w-4xl max-w-[95%] p-4 sm:p-6"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="grid place-items-center">
              <div className="w-full max-w-[250px] sm:max-w-[321px]">
                <Image
                  src="/images/congrats.gif"
                  alt="congrats"
                  width={321}
                  height={321}
                  className="w-full h-auto"
                />
              </div>
              <span className={"text-2xl sm:text-3xl md:text-4xl font-bold"}>You&apos;re all set!</span>
            </DialogTitle>
            <DialogDescription className="text-center text-base sm:text-xl md:text-2xl font-normal text-midnight-blue">
              Congratulations! You&apos;ve successfully completed the onboarding
              process, and your details are being reviewed. In the meantime,
              start exploring and make the most of your financial journey with
              us!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2 sm:mt-4 justify-center w-full items-center">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={navigateToDashboard}
              className="w-full sm:w-max flex justify-center items-center gap-2 text-sm sm:text-base"
            >
              Proceed to Dashboard
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {showCongrats && <Confetti />}
    </>
  );
};

export default BusinessProfileStepper;
