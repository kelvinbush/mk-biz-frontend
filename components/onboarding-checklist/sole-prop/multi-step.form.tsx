import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { Icons } from "@/components/icons";
import Link from "next/link";
import HelpModal from "@/components/onboarding-checklist/business-profile/forms/help-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Step {
  content: ReactNode;
  title: string;
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
}
const SUPPORT_EMAIL = "support@melaninkapital.com";

export default function MultiStepForm({
  steps,
  currentStep,
}: MultiStepFormProps) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {}, [currentStep]);

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
          <span className="text-[#93989C]">Step 3 : Documents Upload</span>
        </div>
        <div className="rounded-sm bg-white">
          <div className="mb-4 sm:mb-6 px-4 sm:px-6 pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm font-medium uppercase text-primary-green">
              Step {currentStep + 1}/{steps.length}
            </p>
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-midnight-blue">
                Documents upload
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
            <p className="mt-2 text-sm sm:text-base text-midnight-blue">
              Upload the required business documents for{" "}
              <span className="text-pink-500">verification</span> purposes
            </p>
          </div>
          <div className="px-4 sm:px-6">{steps[currentStep].content}</div>
        </div>
      </div>
      <HelpModal
        open={isHelpModalOpen}
        setOpen={setIsHelpModalOpen}
        currentStep={`Step 3.${currentStep + 1} Documents Upload -> ${steps[currentStep].title}`}
      />
    </>
  );
}
