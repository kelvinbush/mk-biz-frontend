// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { StatusFilterDropdown } from "./_components/StatusFilterDropdown";
import { StatusTabs } from "./_components/StatusTabs";
import { Pagination } from "./_components/Pagination";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetBusinessProfileByPersonalGuidQuery } from "@/lib/redux/services/user";
import { useGetLoanApplicationsQuery } from "@/lib/redux/services/loans";
import {
  PrestaLoan,
  PrestaLoansResponse,
} from "@/app/(dashboard)/loan-applications/_utils/types";
import { withAuth } from "@/components/auth/RequireAuth";
import { PrestaLoanRow } from "./_components/PrestaLoanRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

const LoanApplicationsPage = () => {
  const guid = useAppSelector(selectCurrentToken);
  const {
    data: response,
    isLoading: isLoadingBusinessProfile,
    isError: isErrorBusinessProfile,
    isSuccess: isSuccessBusinessProfile,
  } = useGetBusinessProfileByPersonalGuidQuery(
    { guid: guid || "" },
    { skip: !guid },
  );

  const [prestaLoans, setPrestaLoans] = useState<PrestaLoan[]>([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [isErrorLoans, setIsErrorLoans] = useState(false);

  // Fetch customer loans directly from the API
  useEffect(() => {
    const fetchCustomerLoans = async (customerRefId: string) => {
      try {
        setIsLoadingLoans(true);
        const response = await fetch(
          `/api/my-loans?customerRefId=${customerRefId}`,
        );
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = (await response.json()) as PrestaLoansResponse;
        console.log("Customer loans data:", data);
        setPrestaLoans(data.data || []);
        setIsLoadingLoans(false);
        return data;
      } catch (error) {
        console.error("Error fetching customer loans:", error);
        setIsErrorLoans(true);
        setIsLoadingLoans(false);
        return null;
      }
    };

    // Only fetch customer loans if business profile is loaded and has prestaRef
    if (response?.business?.prestaRef) {
      fetchCustomerLoans(response.business.prestaRef || "");
    }
  }, [response?.business?.prestaRef]);

  // Only fetch loan applications if we have a valid business GUID
  const businessGuid = response?.business?.businessGuid;
  const shouldFetchLoanApplications =
    isSuccessBusinessProfile && !!businessGuid;

  // We're not using this anymore, but keeping it for reference
  const {} = useGetLoanApplicationsQuery(
    { businessGuid: businessGuid || "" },
    { skip: !shouldFetchLoanApplications || true }, // Skip this query as we're using the Presta API
  );

  const [activeTab, setActiveTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter loans based on status
  const filteredLoans = prestaLoans.filter((loan) => {
    if (filterStatus === "all") return true;

    // Handle case where both status properties are missing
    if (
      filterStatus === "pending" &&
      !loan.approvalStatus &&
      !loan.applicationStatus
    ) {
      return true;
    }

    // In Progress - includes NEWAPPLICATION, INITIATED and INPROGRESS
    if (
      filterStatus === "pending" &&
      (loan.applicationStatus === "NEWAPPLICATION" ||
        loan.applicationStatus === "INITIATED" ||
        loan.applicationStatus === "INPROGRESS")
    ) {
      return true;
    }

    // Approved loans
    if (
      filterStatus === "approved" &&
      (loan.approvalStatus === "APPROVED" ||
        loan.applicationStatus === "COMPLETED")
    ) {
      return true;
    }

    // Rejected loans
    if (
      filterStatus === "rejected" &&
      (loan.approvalStatus === "DENIED" ||
        loan.applicationStatus === "REJECTED")
    ) {
      return true;
    }

    // Disbursed loans
    if (
      filterStatus === "disbursed" &&
      loan.disbursementStatus === "DISBURSED"
    ) {
      return true;
    }

    return false;
  });

  const totalItems = filteredLoans.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredLoans.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setFilterStatus(activeTab);
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    setActiveTab(filterStatus);
    setCurrentPage(1);
  }, [filterStatus]);

  return (
    <div className={"p-2 sm:p-3"}>
      <div className="w-full bg-white p-3 sm:p-6 rounded-md">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl font-medium">
            Loans ({filteredLoans.length})
          </h1>
          <StatusFilterDropdown
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2">
            <StatusTabs setActiveTab={setActiveTab} />
          </div>
          <TabsContent value={activeTab}>
            <Card>
              <CardContent className="p-0">
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#E8E9EA] text-left">
                      <tr>
                        <th className="py-4 px-6 font-medium">LOAN NAME</th>
                        <th className="py-4 px-6 font-medium">LOAN AMOUNT</th>
                        <th className="py-4 px-6 font-medium">LOAN TENURE</th>
                        <th className="py-4 px-6 font-medium">STATUS</th>
                        <th className="py-4 px-6 font-medium">APPLIED ON</th>
                        <th className="py-4 px-6 font-medium">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {isLoadingBusinessProfile || isLoadingLoans ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-6 text-center">
                            Loading loans...
                          </td>
                        </tr>
                      ) : isErrorBusinessProfile || isErrorLoans ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-4 px-6 text-center text-red-500"
                          >
                            Error loading loans. Please try again.
                          </td>
                        </tr>
                      ) : currentItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-6 text-center">
                            No loans found.
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((loan) => (
                          <PrestaLoanRow key={loan.refId} loan={loan} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Shown only on mobile */}
                <div className="sm:hidden">
                  {isLoadingBusinessProfile || isLoadingLoans ? (
                    <div className="p-4 text-center">Loading loans...</div>
                  ) : isErrorBusinessProfile || isErrorLoans ? (
                    <div className="p-4 text-center text-red-500">
                      Error loading loans. Please try again.
                    </div>
                  ) : currentItems.length === 0 ? (
                    <div className="p-4 text-center">No loans found.</div>
                  ) : (
                    <div className="divide-y">
                      {currentItems.map((loan) => (
                        <div
                          key={loan.refId}
                          className="p-4 hover:bg-[#E6FAF5]"
                        >
                          <div className="mb-2">
                            <h3 className="font-medium">{loan.loanDesc}</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">
                                LOAN AMOUNT
                              </p>
                              <p>
                                {loan.currency}{" "}
                                {loan.requestedAmount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">STATUS</p>
                              <div className="mt-1">
                                <Badge
                                  className={`${
                                    loan.disbursementStatus === "DISBURSED"
                                      ? "bg-green-100 text-green-800"
                                      : loan.applicationStatus === "COMPLETED"
                                        ? "bg-blue-100 text-blue-800"
                                        : loan.applicationStatus === "REJECTED"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                  } font-normal shadow-none rounded-md`}
                                >
                                  {loan.disbursementStatus === "DISBURSED"
                                    ? "Disbursed"
                                    : loan.applicationStatus === "COMPLETED"
                                      ? "Approved"
                                      : loan.applicationStatus === "REJECTED"
                                        ? "Rejected"
                                        : loan.applicationStatus || "Pending"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">
                                DISBURSED ON
                              </p>
                              <p>
                                {loan.disbursementDate
                                  ? loan.disbursementDate.split(" ")[0]
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="flex items-end justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-deep-blue-500 gap-1 text-sm hover:text-deep-blue-500 hover:bg-gray-100"
                                onClick={() => {
                                  const modal = document.getElementById(
                                    `loan-modal-${loan.refId}`,
                                  );
                                  if (modal) {
                                    (modal as HTMLDialogElement).showModal();
                                  }
                                }}
                              >
                                <Icons.view className="h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {filteredLoans.length > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default withAuth(LoanApplicationsPage);
