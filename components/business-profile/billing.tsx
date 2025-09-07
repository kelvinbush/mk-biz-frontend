import React from "react";
import { cn } from "@/lib/utils";

type IProps = React.HTMLAttributes<HTMLDivElement>;

const Billing = ({ className, ...props }: IProps) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      Billing
    </div>
  );
};

export default Billing;
