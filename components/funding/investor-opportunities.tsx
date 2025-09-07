import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CompactPagination from "@/components/pagination/compact-pagination";
import { ArrowRight, Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteSavedFundingOpportunityMutation,
  useGetAllFundingOpportunitiesQuery,
  useGetSavedFundingOpportunitiesQuery,
  useSaveFundingOpportunityMutation,
} from "@/lib/redux/services/funding";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";

interface FilterState {
  origin: string;
  operatingCountry: string;
  yearsOfOperation: string;
  sector: string;
  investment: string;
  country: string;
  sectorFocusSsa: string;
  investmentRange: string;
}

const calculateYearsOfOperation = (operatingSince: string) => {
  if (!operatingSince) return "N/A";
  const currentYear = new Date().getFullYear();
  const startYear = parseInt(operatingSince);
  if (isNaN(startYear)) return operatingSince;
  return `${currentYear - startYear} years`;
};

const InvestorOpportunities = () => {
  const guid = useAppSelector(selectCurrentToken);
  const { data: fundingData, isLoading } = useGetAllFundingOpportunitiesQuery();
  const { data: fundingDataSaved } = useGetSavedFundingOpportunitiesQuery(
    guid ?? "",
  );
  const [mutation] = useSaveFundingOpportunityMutation();
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    origin: "",
    operatingCountry: "",
    yearsOfOperation: "",
    sector: "",
    investment: "",
    country: "",
    sectorFocusSsa: "",
    investmentRange: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  const [deleteSavedFundingOpportunity] =
    useDeleteSavedFundingOpportunityMutation();

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

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

  const resetFilters = () => {
    setFilters({
      origin: "",
      operatingCountry: "",
      yearsOfOperation: "",
      sector: "",
      investment: "",
      country: "",
      sectorFocusSsa: "",
      investmentRange: "",
    });
    setSearchQuery("");
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

  const filterOptions = useMemo(() => {
    if (!fundingData?.fundingOpportunities.length)
      return {
        countries: [],
        sectors: [],
        origins: [],
        investmentRanges: [],
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
      investmentRanges: Array.from(
        new Set(
          fundingData?.fundingOpportunities
            .map((item) => item.totalFundSize)
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
      <div className="grid grid-cols-1 gap-6 p-2 md:p-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
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
        <div className="flex flex-col items-center justify-center py-12 text-center w-full">
          <Icons.emptyFunds className="h-32 w-32 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Investor Opportunities Available
          </h3>
          <p className="text-gray-500">
            Check back later for new investment opportunities.
          </p>
        </div>
      );
    }

    if (noFilteredResults && hasActiveFilters) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center w-full">
          <Icons.emptyFunds className="h-32 w-32 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No investors found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms.
          </p>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="mt-4 flex items-center gap-2 bg-gray-50 hover:bg-gray-100"
          >
            Reset Filters
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-2 md:p-4">
      <header className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
        <h1 className="text-xl md:text-2xl font-bold">
          Investors ({filteredOpportunities.length})
        </h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:space-x-4">
          <Input
            type="text"
            placeholder="Search for investor..."
            className="w-full md:w-64 h-10 md:h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => setFiltersVisible(!filtersVisible)}
            className={
              "flex gap-2 items-center justify-center w-full md:w-auto bg-[#E8E9EA] text-midnight-blue hover:text-midnight-blue/90"
            }
            size={"lg"}
          >
            <Icons.filter className="h-4 w-4" />
            {filtersVisible ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </header>

      {filtersVisible && (
        <div className="mb-4 md:mb-6 flex flex-col md:flex-row flex-wrap gap-3 md:gap-4">
          <Select
            value={filters.country}
            onValueChange={(value) =>
              setFilters({ ...filters, country: value })
            }
          >
            <SelectTrigger className="w-full md:w-[200px]">
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
            <SelectTrigger className="w-full md:w-[200px]">
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
            <SelectTrigger className="w-full md:w-[200px]">
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
            className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 w-full md:w-auto"
          >
            Reset Filters
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-6 p-2 md:p-4 md:grid-cols-2 lg:grid-cols-3">
        {currentItems.length > 0 ? (
          currentItems.map((investor) => {
            return (
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
                        <p className="text-xs md:text-sm text-[#444C53]">
                          Total Fund Size
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-lg md:text-xl">
                          {calculateYearsOfOperation(investor.operatingSince)}
                        </p>
                        <p className="text-xs md:text-sm text-[#444C53]">
                          Years of Operation
                        </p>
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
                    {fundingDataSaved?.fundingOpportunities?.find(
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
            );
          })
        ) : (
          <EmptyState />
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="text-sm text-gray-500 text-center">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredOpportunities.length)} of{" "}
            {filteredOpportunities.length} investors
          </div>
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

export default InvestorOpportunities;
