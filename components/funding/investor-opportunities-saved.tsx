import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ArrowRight, Bookmark, X } from "lucide-react";
import CompactPagination from "@/components/pagination/compact-pagination";
import Link from "next/link";
import {
  useDeleteSavedFundingOpportunityMutation,
  useGetSavedFundingOpportunitiesQuery,
} from "@/lib/redux/services/funding";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FilterState {
  origin: string;
  country: string;
  sectorFocusSsa: string;
}

const InvestorOpportunitiesSaved = () => {
  const guid = useAppSelector(selectCurrentToken);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [filters, setFilters] = useState<FilterState>({
    origin: "",
    country: "",
    sectorFocusSsa: "",
  });

  const { data: fundingData, isLoading } = useGetSavedFundingOpportunitiesQuery(
    guid ?? "",
  );

  const [deleteSavedFundingOpportunity] =
    useDeleteSavedFundingOpportunityMutation();

  const resetFilters = () => {
    setFilters({
      origin: "",
      country: "",
      sectorFocusSsa: "",
    });
    setSearchQuery("");
  };

  const filterOptions = useMemo(() => {
    if (!fundingData?.fundingOpportunities.length)
      return {
        countries: [],
        sectors: [],
        origins: [],
      };

    return {
      countries: Array.from(
        new Set(
          fundingData?.fundingOpportunities
            .map((item) => item.countriesOfOperation)
            .filter(Boolean),
        ),
      ).sort(),
      sectors: Array.from(
        new Set(
          fundingData?.fundingOpportunities
            .map((item) => item.sectorFocusSsa)
            .filter(Boolean),
        ),
      ).sort(),
      origins: Array.from(
        new Set(
          fundingData?.fundingOpportunities
            .map((item) => item.countryOfOrigin)
            .filter(Boolean),
        ),
      ).sort(),
    };
  }, [fundingData]);

  const filteredOpportunities = useMemo(() => {
    if (!fundingData) return [];

    return fundingData?.fundingOpportunities.filter((opportunity) => {
      // Search query matching
      const matchesSearch = searchQuery
        ? opportunity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opportunity.sectorFocusSsa
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          opportunity.countryOfOrigin
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          opportunity.countriesOfOperation
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true;

      const matchesCountry =
        !filters.country ||
        opportunity.countriesOfOperation
          ?.toLowerCase()
          .includes(filters.country.toLowerCase());

      const matchesSector =
        !filters.sectorFocusSsa ||
        opportunity.sectorFocusSsa
          ?.toLowerCase()
          .includes(filters.sectorFocusSsa.toLowerCase());

      const matchesOrigin =
        !filters.origin ||
        opportunity.countryOfOrigin
          ?.toLowerCase()
          .includes(filters.origin.toLowerCase());

      return matchesSearch && matchesCountry && matchesSector && matchesOrigin;
    });
  }, [fundingData, filters, searchQuery]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-32 bg-gray-200" />
            <CardContent className="space-y-4 p-4">
              <div className="h-4 w-3/4 bg-gray-200" />
              <div className="h-4 w-1/2 bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalItems = filteredOpportunities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredOpportunities.slice(startIndex, endIndex);

  const hasActiveFilters =
    Object.values(filters).some((value) => value && value !== "all") ||
    searchQuery;
  const noInvestors = !fundingData?.fundingOpportunities?.length;
  const noFilteredResults = filteredOpportunities.length === 0;

  const EmptyState = () => {
    if (noInvestors) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.noSaved className="h-32 w-32 mb-6" />
          <h3 className="text-midnight-blue mb-2 max-w-4xl">
            Looks like you haven&apos;t saved any investor opportunities. <br />{" "}
            Start exploring and save the ones that catch your eye.
          </h3>
          <Link href={"/funding/investor-opportunities"}>
            <Button className="mt-4 flex items-center gap-2 " size={"lg"}>
              Explore Investor Opportunities
              <ArrowRight />
            </Button>
          </Link>
        </div>
      );
    }

    if (noFilteredResults && hasActiveFilters) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icons.emptyFunds className="h-32 w-32 mb-6" />
          <h3 className="text-midnight-blue mb-2">
            No matching investors found
          </h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search term
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      );
    }

    return null;
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

  return (
    <div className="p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Investors ({filteredOpportunities.length})
        </h1>
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search for investor..."
            className="w-64 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => setFiltersVisible(!filtersVisible)}
            className={
              "flex gap-2 items-center justify-between bg-[#E8E9EA] text-midnight-blue hover:text-midnight-blue/90"
            }
            size={"lg"}
          >
            <Icons.filter className="h-4 w-4" />
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </header>

      {filtersVisible && (
        <div className="mb-6 flex flex-wrap gap-4">
          <Select
            value={filters.country}
            onValueChange={(value) =>
              setFilters({ ...filters, country: value })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.countries.map((country) => (
                <SelectItem key={country} value={country.toLowerCase()}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.sectorFocusSsa}
            onValueChange={(value) =>
              setFilters({ ...filters, sectorFocusSsa: value })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.sectors.map((sector) => (
                <SelectItem key={sector} value={sector.toLowerCase()}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.origin}
            onValueChange={(value) => setFilters({ ...filters, origin: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Country of Origin" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.origins.map((origin) => (
                <SelectItem key={origin} value={origin.toLowerCase()}>
                  {origin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
          >
            Reset Filters
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
        {currentItems.length > 0 ? (
          currentItems.map((investor) => (
            <Card
              key={investor.reference}
              className={"shadow-md rounded-sm flex flex-col"}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className={"text-2xl font-bold text-[#151F28]"}>
                      {investor.name}
                    </CardTitle>
                    <p className="text-[#151F28]">
                      Origin:{" "}
                      <span className={"font-medium mr-1"}>
                        {investor.countryOfOrigin}
                      </span>{" "}
                      |<span className={"ml-1"}> Years of operation: </span>
                      <span className={"font-medium"}>
                        {investor.operatingSince}
                      </span>
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={"space-y-4 flex flex-col  flex-1"}>
                <div className={"flex-1 space-y-4"}>
                  <div className="font-medium text-[#444C53]">
                    Investment focus:{" "}
                    <span className={"font-normal text-[#62696F]"}>
                      {investor.sectorFocusSsa}
                    </span>
                  </div>
                  <div className="font-medium text-[#444C53]">
                    Countries of operation:{" "}
                    <span className={"font-normal text-[#62696F]"}>
                      {investor.countriesOfOperation}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className={"border-r border-dashed border-[#B6BABC]"}>
                      <p className={"font-bold text-xl"}>
                        {investor.totalFundSize}
                      </p>
                      <p className={"text-[#444C53]"}>Total Fund Size</p>
                    </div>
                    <div>
                      <p className={"font-bold text-xl"}>
                        {investor.operatingSince}
                      </p>
                      <p className={"text-[#444C53]"}>Years of Operation</p>
                    </div>
                  </div>
                  <div>
                    <p className={"font-medium text-[#444C53]"}>
                      Sectors of interest
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          "rounded-lg border-none bg-[#B0EFDF] font-medium text-[#007054] shadow-none text-xs"
                        }
                      >
                        {investor.sectorFocusSsa}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    "mt-auto flex justify-between border-t pt-4 items-start"
                  }
                >
                  <Button
                    className="flex items-center gap-2 px-8"
                    asChild
                    size={"lg"}
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
                  <div
                    className={
                      "grid cursor-pointer place-items-center rounded-full border-2 border-[#F582BD] bg-[#F582BD] px-2.5 py-2.5 text-white hover:scale-110 transition-transform duration-200"
                    }
                    onClick={() => deleteFunding(investor.reference)}
                  >
                    <Bookmark size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center items-center min-h-[400px]">
            <EmptyState />
          </div>
        )}
      </div>

      {/* Pagination UI */}
      {totalItems > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-gray-200 px-4 py-3 sm:px-6">
          <p className="text-sm text-gray-700 text-center">
            Showing <span className="font-medium">{startIndex + 1}</span> to {" "}
            <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of {" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
          <CompactPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            siblingCount={1}
            boundaryCount={1}
          />
        </div>
      )}
    </div>
  );
};

export default InvestorOpportunitiesSaved;
