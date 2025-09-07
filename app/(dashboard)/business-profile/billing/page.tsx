"use client";
import { Suspense } from "react";
import { withAuth } from "@/components/auth/RequireAuth";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";

function CompanyBillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-4 md:space-y-8 p-3 md:p-6">
        {/* Current Plan Summary */}
        <div className={"border rounded-lg p-3 md:p-4 pb-4 md:pb-6 shadow-md"}>
          <h2 className="text-xl md:text-2xl font-medium">Current Plan Summary</h2>
          <Separator className={"my-3 md:my-4"} />
          <div className="grid grid-cols-1 md:grid-cols-9 gap-4 md:gap-8">
            <div className={"space-y-1"}>
              <p className="font-medium text-sm md:text-base text-[#93989C]">Plan name</p>
              <p className="text-base md:text-lg font-medium">Free Plan</p>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <Separator orientation="vertical" className="h-full" />
            </div>
            <div className={"space-y-1"}>
              <p className="font-medium text-sm md:text-base text-[#93989C]">Billing cycle</p>
              <p className="text-base md:text-lg font-medium">-</p>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <Separator orientation="vertical" className="h-full" />
            </div>
            <div className={"space-y-1"}>
              <p className="font-medium text-sm md:text-base text-[#93989C]">Plan cost</p>
              <p className="text-base md:text-lg font-medium">$0.00/mo</p>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <Separator orientation="vertical" className="h-full" />
            </div>
            <div className={"space-y-1"}>
              <p className="font-medium text-sm md:text-base text-[#93989C]">Renews on</p>
              <p className="text-base md:text-lg font-medium">-</p>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <Separator orientation="vertical" className="h-full" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm md:text-base text-[#93989C]">Status</p>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Invoices</h2>
          <div className="flex flex-col items-center justify-center py-6 md:py-12 text-center">
            <Icons.noInvoiceIcon className="w-16 h-16 md:w-auto md:h-auto" />
            <p className="mt-2 md:mt-4 max-w-4xl text-sm md:text-base">
              It looks like you&apos;re currently on our Free Plan which
              doesn&apos;t include invoicing. We&apos;ll keep you updated on
              upcoming plans and services to enhance your experience.
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default withAuth(CompanyBillingPage);
