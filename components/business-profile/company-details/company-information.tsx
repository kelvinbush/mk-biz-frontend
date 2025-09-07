import React from "react";
import { cn } from "@/lib/utils";
import BusinessProfileForm from "@/components/business-profile/business-profile.form";

type IProps = React.HTMLAttributes<HTMLDivElement>;

const CompanyInformation = ({ className, ...props }: IProps) => {
  return (
    <div className={cn("space-y-3 md:space-y-4", className)} {...props}>
      <div className="mb-4 md:mb-8 flex items-center gap-4 md:gap-8 text-xl md:text-2xl font-medium">
        <h2 className="shrink-0">Company Information</h2>
        <div className="h-[1px] md:h-[1.5px] w-full bg-gray-400" />
      </div>
      <div className="h-[calc(100vh-18rem)] md:h-[calc(100vh-22rem)] overflow-y-auto pr-0 md:pr-4">
        <BusinessProfileForm />
      </div>
    </div>
  );
};

export default CompanyInformation;
