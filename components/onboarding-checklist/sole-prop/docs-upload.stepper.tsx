import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProofRegistration from "./forms/proof-registration";
import BankStatements from "./forms/bank-statements";
import RegulatoryDocs from "./forms/regulatory-docs";
import MultiStepForm from "./multi-step.form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/ui/confetti";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCompletionPercentage } from "@/hooks/use-completion-percentage";

const DocsUploadStepper = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const { completionPercentage } = useCompletionPercentage();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("step", String(next));
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleFinish = () => {
    if (completionPercentage === 100) {
      setShowCongrats(true);
    } else {
      router.push("/onboarding-checklist");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("step", String(prev));
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const navigateToDashboard = () => {
    router.push("/");
  };

  const steps = [
    {
      title: "Proof of Registration",
      content: (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-medium text-midnight-blue">
            Proof of Registration
          </h2>
          <ProofRegistration onNext={handleNext} />
        </div>
      ),
    },
    {
      title: "Bank Statements",
      content: (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-medium text-midnight-blue">
            Bank Statements
          </h2>
          <BankStatements onNext={handleNext} onPrevious={handlePrev} />
        </div>
      ),
    },
    {
      title: "Regulatory Documents",
      content: (
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-medium text-midnight-blue">
            Regulatory documents
          </h2>
          <RegulatoryDocs onNext={handleFinish} onPrevious={handlePrev} />
        </div>
      ),
    },
  ];

  // Sync: URL -> state (read step from URL)
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const parsed = stepParam !== null ? Number(stepParam) : 0;
    const maxIdx = Math.max(0, steps.length - 1);
    const clamped = Number.isFinite(parsed)
      ? Math.min(Math.max(parsed, 0), maxIdx)
      : 0;
    if (clamped !== currentStep) setCurrentStep(clamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, steps.length]);

  // Removed state->URL effect to avoid loops; URL is updated only in handlers

  return (
    <>
      <MultiStepForm steps={steps} currentStep={currentStep} />

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
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                You&apos;re all set!
              </span>
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

export default DocsUploadStepper;
