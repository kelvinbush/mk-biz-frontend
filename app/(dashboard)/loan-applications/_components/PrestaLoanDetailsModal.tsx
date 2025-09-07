import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrestaLoan } from "../_utils/types";
import { Separator } from "@/components/ui/separator";

interface PrestaLoanDetailsModalProps {
  loan: PrestaLoan;
  isOpen: boolean;
  onClose: () => void;
}

export const PrestaLoanDetailsModal: React.FC<PrestaLoanDetailsModalProps> = ({
  loan,
  isOpen,
  onClose,
}) => {
  if (!loan) return null;

  // Format the date from "DD/MM/YYYY HH:MM" to "Month DD, YYYY"
  const formatDate = (dateString: string) => {
    try {
      // The date format is "DD/MM/YYYY HH:MM"
      const [datePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${monthNames[parseInt(month) - 1]} ${day}, ${year}`;
    } catch (error) {
      console.error(error);
      return dateString || "Not available";
    }
  };

  // Get status color based on application, approval and disbursement status
  const getStatusColor = () => {
    // First check disbursement status
    if (loan.disbursementStatus === "DISBURSED") {
      return "bg-green-100 text-green-800";
    } else if (loan.disbursementStatus === "FAILED") {
      return "bg-red-100 text-red-800";
    }

    // Then check approval status
    if (loan.approvalStatus === "APPROVED") {
      return "bg-green-100 text-green-800";
    } else if (loan.approvalStatus === "DENIED") {
      return "bg-red-100 text-red-800";
    } else if (loan.approvalStatus === "FAILED") {
      return "bg-red-100 text-red-800";
    }

    // Then check application status
    if (loan.applicationStatus === "COMPLETED") {
      return "bg-blue-100 text-blue-800";
    } else if (loan.applicationStatus === "FAILED") {
      return "bg-red-100 text-red-800";
    } else if (loan.applicationStatus === "INPROGRESS") {
      return "bg-blue-100 text-blue-800";
    } else if (loan.applicationStatus === "INITIATED") {
      return "bg-yellow-100 text-yellow-800";
    } else if (loan.applicationStatus === "NEWAPPLICATION") {
      return "bg-yellow-100 text-yellow-800";
    }

    // Default case - pending or not yet processed
    return "bg-yellow-100 text-yellow-800";
  };

  // Get status text
  const getStatusText = () => {
    // If all statuses are absent, loan has not been processed
    if (
      !loan.approvalStatus &&
      !loan.applicationStatus &&
      !loan.disbursementStatus
    ) {
      return "Pending Processing";
    }

    // First check disbursement status
    if (loan.disbursementStatus === "DISBURSED") {
      return "Disbursed";
    } else if (loan.disbursementStatus === "FAILED") {
      return "Disbursement Failed";
    } else if (loan.disbursementStatus === "PENDING") {
      return "Pending Disbursement";
    }

    // Then check approval status
    if (loan.approvalStatus === "APPROVED") {
      return "Approved";
    } else if (loan.approvalStatus === "DENIED") {
      return "Denied";
    } else if (loan.approvalStatus === "FAILED") {
      return "Approval Failed";
    } else if (loan.approvalStatus === "PENDING") {
      return "Pending Approval";
    }

    // Then check application status
    if (loan.applicationStatus === "COMPLETED") {
      return "Application Completed";
    } else if (loan.applicationStatus === "FAILED") {
      return "Application Failed";
    } else if (loan.applicationStatus === "INPROGRESS") {
      return "In Progress";
    } else if (loan.applicationStatus === "INITIATED") {
      return "Application Initiated";
    } else if (loan.applicationStatus === "NEWAPPLICATION") {
      return "New Application";
    }

    // Default case
    return "Processing";
  };

  const getLoanTenure = () => {
    const parse = (str: string) => {
      const [day, month, yearTime] = str.split("/");
      const [year, time] = yearTime.split(" ");
      return new Date(`${year}-${month}-${day}T${time || "00:00"}:00`);
    };

    const start = parse(loan.disbursementDate);
    const end = parse(loan.dueDate);

    return (
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle className="text-4xl font-medium">
              Loan Details
            </DialogTitle>
            <Separator
              orientation="vertical"
              className="h-7 w-0.5 bg-[#151F28]"
            />
            <p className={"text-xl text-[#444C53]"}>Status:</p>
            <Badge
              className={`${getStatusColor()} font-normal shadow-none rounded-md`}
            >
              {getStatusText()}
            </Badge>
          </div>
        </DialogHeader>
        <div className="mt-0.5">
          <p className="text-[#444C53] mb-1 text-2xl">
            Review your loan details below
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-gray-600 mb-1">Loan name</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={loan.loanDesc}
                  readOnly
                  className="flex-1 p-3 rounded-md outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-1">Loan amount</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={loan.requestedAmount.toLocaleString()}
                  readOnly
                  className="flex-1 p-3 rounded-l-md outline-none"
                />
                <div className="bg-gray-100 flex items-center px-4 rounded-r-md">
                  <span className="font-medium">EUR</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-1">Interest amount</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={loan.interestAmount.toLocaleString()}
                  readOnly
                  className="flex-1 p-3 rounded-l-md outline-none"
                />
                <div className="bg-gray-100 flex items-center px-4 rounded-r-md">
                  <span className="font-medium">EUR</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-1">Loan Tenure</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={getLoanTenure()}
                  readOnly
                  className="flex-1 p-3 rounded-l-md outline-none"
                />
                <div className="bg-gray-100 flex items-center px-4 rounded-r-md">
                  <span className="font-medium">MONTHS</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-1">Application date</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={formatDate(loan.disbursementDate)}
                  readOnly
                  className="flex-1 p-3 rounded-md outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-1">Due date</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={formatDate(loan.dueDate)}
                  readOnly
                  className="flex-1 p-3 rounded-md outline-none"
                />
              </div>
            </div>
            {loan.disbursementStatus === "DISBURSED" && (
              <>
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Disbursement method</p>
                  <div className="flex border rounded-md">
                    <input
                      type="text"
                      value={"BANK"}
                      readOnly
                      className="flex-1 p-3 rounded-md outline-none"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-gray-600 mb-1">Repayment status</p>
                  <div className="flex border rounded-md">
                    <input
                      type="text"
                      value={loan.repaymentStatus}
                      readOnly
                      className="flex-1 p-3 rounded-md outline-none"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 border-t pt-4 flex justify-end">
            <DialogClose asChild>
              <Button size={"lg"} className="bg-black hover:bg-gray-800">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
