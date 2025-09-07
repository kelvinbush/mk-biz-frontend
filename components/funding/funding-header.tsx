import React from "react";
import { cn } from "@/lib/utils";

type FundingHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const FundingHeader = ({ className, ...props }: FundingHeaderProps) => {
  const backgroundStyle = React.useMemo(
    () => ({
      backgroundImage: "url(/images/abstract2.png)",
      backgroundPosition: "center",
      backgroundSize: "cover",
    }),
    [],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-gradient-to-r from-gray-900/90 to-gray-900/70",
        className,
      )}
      {...props}
      style={backgroundStyle}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="px-4 md:px-6 py-6 md:py-10 text-center text-white relative space-y-2">
        <h1 className={"text-xl md:text-3xl font-bold"}>
          Explore our funding opportunities to fuel your business growth!
        </h1>
        <h4 className={"text-base md:text-2xl max-w-4xl mx-auto"}>
          Looking for loans or investor backing? We got you covered with
          flexible options to support your vision
        </h4>
      </div>
    </div>
  );
};

export default React.memo(FundingHeader);
