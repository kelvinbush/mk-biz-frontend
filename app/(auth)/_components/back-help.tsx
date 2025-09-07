"use client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SUPPORT_EMAIL = "support@melaninkapital.com";

export function BackAndHelp({
  showBack = true,
  backHref = "/sign-in",
}: {
  showBack?: boolean;
  backHref?: string;
}) {
  return (
    <div className="flex justify-between items-center p-6 w-full">
      {showBack && (
        <Link href={backHref} passHref>
          <Button
            variant="ghost"
            className="flex items-center gap-1 text-sm font-medium text-midnight-blue hover:text-gray-900"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      )}
      <Button
        variant="ghost"
        className="flex items-center gap-1 text-sm font-medium"
        onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}
        title="Contact Support"
      >
        Need Help
        <Icons.needHelp className="h-5 w-5" />
      </Button>
    </div>
  );
}
