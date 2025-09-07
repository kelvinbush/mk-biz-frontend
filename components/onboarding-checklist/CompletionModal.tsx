"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CompletionModalProps = {
  open: boolean;
  proceedHref?: string;
};

export default function CompletionModal({ open, proceedHref = "/dashboard" }: CompletionModalProps) {
  // Controlled dialog; onOpenChange is intentionally a no-op to keep it persistent when open is true
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-xl p-6 sm:p-8">
        <DialogHeader className="items-center text-center">
          <div className="mb-4 sm:mb-6">
            <Image
              src="/congrats.gif"
              alt="Congratulations"
              width={240}
              height={240}
              className="mx-auto h-36 w-36 sm:h-48 sm:w-48 object-contain"
              priority
            />
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-extrabold">You’re all set!</DialogTitle>
          <DialogDescription className="mt-2 text-sm sm:text-base text-center text-muted-foreground">
            Congratulations! You&apos;ve successfully completed the onboarding process, and your details are being reviewed. In the meantime, start exploring and make the most of your financial journey with us!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-center">
          <Link href={proceedHref}>
            <Button className="px-6 sm:px-8">Proceed to Dashboard →</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
