"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Bookmark } from "lucide-react";
import {
  useDeleteSavedFundingOpportunityMutation,
  useGetAllFundingOpportunitiesQuery,
  useGetSavedFundingOpportunitiesQuery,
  useSaveFundingOpportunityMutation,
} from "@/lib/redux/services/funding";
import Link from "next/link";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { userApiSlice } from "@/lib/redux/services/user";
import { toast } from "sonner";

const OpportunityCardSkeleton = () => (
  <Card className="shadow-lg">
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    </CardContent>
  </Card>
);

const calculateYearsOfOperation = (operatingSince: string) => {
  if (!operatingSince) return "N/A";
  const currentYear = new Date().getFullYear();
  const startYear = parseInt(operatingSince);
  if (isNaN(startYear)) return operatingSince;
  return `${currentYear - startYear} years`;
};

export default function DashboardOpportunities() {
  const guid = useAppSelector(selectCurrentToken);
  const { data: businessProfile } =
    userApiSlice.useGetBusinessProfileByPersonalGuidQuery(
      { guid: guid || "" },
      { skip: !guid },
    );

  const {
    data: opportunities,
    isLoading,
    error,
  } = useGetAllFundingOpportunitiesQuery();

  const { data: fundingDataSaved } = useGetSavedFundingOpportunitiesQuery(
    guid ?? "",
  );

  const [deleteSavedFundingOpportunity] =
    useDeleteSavedFundingOpportunityMutation();
  const [mutation] = useSaveFundingOpportunityMutation();

  const saveFundingOpportunity = (fundingOpportunityGuid: string) => {
    toast.promise(
      mutation({ personalGuid: guid ?? "", fundingOpportunityGuid }).unwrap(),
      {
        loading: "Saving funding opportunity...",
        success: () => {
          return "Funding opportunity saved successfully";
        },
        error: "Failed to save funding opportunity",
      },
    );
  };

  const deleteFunding = (id: string) => {
    toast.promise(
      deleteSavedFundingOpportunity({
        personalGuid: guid ?? "",
        fundId: id,
      }).unwrap(),
      {
        loading: "Removing bookmark...",
        success: () => {
          return "Funding opportunity removed successfully";
        },
        error: "Failed to remove funding opportunity",
      },
    );
  };

  const relevantOpportunities = opportunities?.fundingOpportunities
    .filter(
      (opportunity) =>
        opportunity.sectorFocusSsa.toLowerCase() ===
        businessProfile?.business?.sector.toLowerCase(),
    )
    .slice(0, 4);

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-destructive">Failed to load funding opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
        <h2 className="text-xl md:text-2xl font-medium text-midnight-blue">
          Recommended Investor Opportunities
        </h2>
        <Link href="/funding/investor-opportunities">
          <Button variant="link" className="text-primary underline px-0 md:px-4">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, index) => <OpportunityCardSkeleton key={index} />)
          : relevantOpportunities && relevantOpportunities.length > 0
            ? relevantOpportunities.map((investor) => (
                <Card
                  key={investor.reference}
                  className="shadow-lg flex flex-col"
                >
                  <CardContent className="p-4 md:p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-[#151F28]">
                          {investor.name}
                        </h3>
                        <p className="text-sm md:text-base text-[#151F28]">
                          Origin:{" "}
                          <span className="font-medium mr-1">
                            {investor.countryOfOrigin}
                          </span>{" "}
                          |<span className="ml-1"> Founded: </span>
                          <span className="font-medium">
                            {investor.operatingSince}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 md:mt-4 space-y-3 md:space-y-4 flex-1">
                      <div className="font-medium text-sm md:text-base text-[#444C53]">
                        Investment focus:{" "}
                        <span className="font-normal text-[#62696F]">
                          {investor.sectorFocusSsa}
                        </span>
                      </div>
                      <div className="font-medium text-sm md:text-base text-[#444C53]">
                        Countries of operation:{" "}
                        <span className="font-normal text-[#62696F]">
                          {investor.countriesOfOperation}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:gap-6">
                        <div className="border-r border-dashed border-[#B6BABC]">
                          <p className="font-bold text-lg md:text-xl">
                            {investor.totalFundSize}
                          </p>
                          <p className="text-xs md:text-sm text-[#444C53]">Total Fund Size</p>
                        </div>
                        <div>
                          <p className="font-bold text-lg md:text-xl">
                            {calculateYearsOfOperation(investor.operatingSince)}
                          </p>
                          <p className="text-xs md:text-sm text-[#444C53]">Years of Operation</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base text-[#444C53]">
                          Sectors of interest
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="rounded-lg border-none bg-[#B0EFDF] font-medium text-[#007054] shadow-none text-xs"
                          >
                            {investor.sectorFocusSsa}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center gap-3 md:gap-0 md:justify-between">
                      <Button
                        className="flex w-full md:w-auto items-center justify-center gap-2 px-4 md:px-8"
                        asChild
                        size="lg"
                      >
                        <a
                          href={investor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Website
                          <ArrowRight size={20} />
                        </a>
                      </Button>
                      {fundingDataSaved?.fundingOpportunities.find(
                        (inv) => inv.reference === investor.reference,
                      ) ? (
                        <div
                          className="grid cursor-pointer place-items-center rounded-full border-2 border-[#F582BD] bg-[#F582BD] px-2.5 py-2.5 text-white hover:scale-110 transition-transform duration-200"
                          onClick={() => deleteFunding(investor.reference)}
                        >
                          <Bookmark size={20} />
                        </div>
                      ) : (
                        <div
                          className="grid cursor-pointer place-items-center rounded-full border-2 border-[#F582BD] bg-transparent px-2.5 py-2.5 text-[#F582BD] hover:scale-110 transition-transform duration-200"
                          onClick={() =>
                            saveFundingOpportunity(investor.reference)
                          }
                        >
                          <Bookmark size={20} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            : opportunities?.fundingOpportunities
                .slice(0, 4)
                .map((investor) => (
                  <Card
                    key={investor.reference}
                    className="shadow-lg flex flex-col"
                  >
                    <CardContent className="p-4 md:p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-[#151F28]">
                            {investor.name}
                          </h3>
                          <p className="text-sm md:text-base text-[#151F28]">
                            Origin:{" "}
                            <span className="font-medium mr-1">
                              {investor.countryOfOrigin}
                            </span>{" "}
                            |<span className="ml-1"> Founded: </span>
                            <span className="font-medium">
                              {investor.operatingSince}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 md:mt-4 space-y-3 md:space-y-4 flex-1">
                        <div className="font-medium text-sm md:text-base text-[#444C53]">
                          Investment focus:{" "}
                          <span className="font-normal text-[#62696F]">
                            {investor.sectorFocusSsa}
                          </span>
                        </div>
                        <div className="font-medium text-sm md:text-base text-[#444C53]">
                          Countries of operation:{" "}
                          <span className="font-normal text-[#62696F]">
                            {investor.countriesOfOperation}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-6">
                          <div className="border-r border-dashed border-[#B6BABC]">
                            <p className="font-bold text-lg md:text-xl">
                              {investor.totalFundSize}
                            </p>
                            <p className="text-xs md:text-sm text-[#444C53]">Total Fund Size</p>
                          </div>
                          <div>
                            <p className="font-bold text-lg md:text-xl">
                              {calculateYearsOfOperation(investor.operatingSince)}
                            </p>
                            <p className="text-xs md:text-sm text-[#444C53]">Years of Operation</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm md:text-base text-[#444C53]">
                            Sectors of interest
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              variant="secondary"
                              className="rounded-lg border-none bg-[#B0EFDF] font-medium text-[#007054] shadow-none text-xs"
                            >
                              {investor.sectorFocusSsa}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center gap-3 md:gap-0 md:justify-between">
                        <Button
                          className="flex w-full md:w-auto items-center justify-center gap-2 px-4 md:px-8"
                          asChild
                          size="lg"
                        >
                          <a
                            href={investor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Website
                            <ArrowRight size={20} />
                          </a>
                        </Button>
                        {fundingDataSaved?.fundingOpportunities.find(
                          (inv) => inv.reference === investor.reference,
                        ) ? (
                          <div
                            className="grid cursor-pointer place-items-center rounded-full border-2 border-[#F582BD] bg-[#F582BD] px-2.5 py-2.5 text-white hover:scale-110 transition-transform duration-200"
                            onClick={() => deleteFunding(investor.reference)}
                          >
                            <Bookmark size={20} />
                          </div>
                        ) : (
                          <div
                            className="grid cursor-pointer place-items-center rounded-full border-2 border-[#F582BD] bg-transparent px-2.5 py-2.5 text-[#F582BD] hover:scale-110 transition-transform duration-200"
                            onClick={() =>
                              saveFundingOpportunity(investor.reference)
                            }
                          >
                            <Bookmark size={20} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
      </div>
    </div>
  );
}
