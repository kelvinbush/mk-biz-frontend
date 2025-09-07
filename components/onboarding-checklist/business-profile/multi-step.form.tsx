import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HelpModal from "./forms/help-modal";
import Link from "next/link";

interface Step {
  content: ReactNode;
  title: string;
  description: ReactNode;
}

interface MultiStepFormProps {
  steps: Step[];
  setCurrentStep: (step: number) => void;
  currentStep: number;
}
const SUPPORT_EMAIL = "support@melaninkapital.com";
export default function MultiStepBusinessForm({
  steps,
  currentStep,
}: MultiStepFormProps) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <>
      <div className="mt-2 sm:mt-4 space-y-4 sm:space-y-6 px-2 sm:px-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            href={"/onboarding-checklist"}
            className="flex items-center gap-1 text-xs sm:text-sm text-primary-green transition-all duration-300 hover:underline"
          >
            <MoveLeft size={14} className="" />
            Onboarding Checklist
          </Link>
          <span className="text-midnight-blue">&middot;</span>
          <span className="text-[#93989C]">
            Step 2 : Complete your business profile
          </span>
        </div>
        <div className="space-y-4 sm:space-y-8 rounded-sm bg-white">
          <div className="space-y-2 px-4 sm:px-8 pt-4 sm:pt-8">
            <p className="text-xs sm:text-sm font-medium uppercase text-primary-green">
              Step {currentStep + 1}/{steps.length}
            </p>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-midnight-blue">
                {steps[currentStep].title}
              </h2>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Get help"
                  >
                    <Icons.needHelp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-green" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() =>
                        (window.location.href = `mailto:${SUPPORT_EMAIL}`)
                      }
                      className="flex items-center gap-2"
                    >
                      <Icons.support />
                      Contact Support
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="text-base sm:text-xl md:text-2xl">
              {steps[currentStep].description}
            </div>
          </div>
          {steps[currentStep].content}
        </div>
      </div>
      <HelpModal
        open={isHelpModalOpen}
        setOpen={setIsHelpModalOpen}
        currentStep={`Step 2.${currentStep + 1} Business Profile -> ${steps[currentStep].title}`}
      />
    </>
  );
}
