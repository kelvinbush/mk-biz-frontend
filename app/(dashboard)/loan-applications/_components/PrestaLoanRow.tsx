import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { PrestaLoan } from "../_utils/types";
import { PrestaLoanDetailsModal } from "./PrestaLoanDetailsModal";

interface PrestaLoanRowProps {
  loan: PrestaLoan;
}

export const PrestaLoanRow: React.FC<PrestaLoanRowProps> = ({ loan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Format the disbursement date
  const formatDate = (dateString: string) => {
    try {
      // The date format is "DD/MM/YYYY HH:MM"
      const [datePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      return `${day} ${getMonthName(parseInt(month))} ${year}`;
    } catch (error) {
      console.error(error);
      return dateString || "N/A";
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1] || "";
  };

  // Get status color based on application and approval status
  const getStatusColor = () => {
    // First check approval status
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
    // If both statuses are absent, loan has not been processed
    if (!loan.approvalStatus && !loan.applicationStatus) {
      return "Pending Processing";
    }

    // First check approval status
    if (loan.approvalStatus === "APPROVED") {
      return "Approved";
    } else if (loan.approvalStatus === "DENIED") {
      return "Denied";
    } else if (loan.approvalStatus === "FAILED") {
      return "Failed";
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

  console.log("Loan data:", loan);

  return (
    <>
      <tr key={loan.refId} className="hover:bg-[#E6FAF5]">
        <td className="py-4 px-6">
          <div>
            <p className="font-medium">{loan.loanDesc}</p>
          </div>
        </td>
        <td className="py-4 px-6">
          EUR {loan.requestedAmount.toLocaleString()}
        </td>
        <td className="py-4 px-6">
          {loan.dueDate && loan.disbursementDate
            ? (() => {
                const parse = (str: string) => {
                  const [day, month, yearTime] = str.split("/");
                  const [year, time] = yearTime.split(" ");
                  return new Date(
                    `${year}-${month}-${day}T${time || "00:00"}:00`,
                  );
                };

                const start = parse(loan.disbursementDate);
                const end = parse(loan.dueDate);

                return (
                  (end.getFullYear() - start.getFullYear()) * 12 +
                  (end.getMonth() - start.getMonth())
                );
              })()
            : 0}{" "}
          MONTHS
        </td>

        <td className="py-4 px-6">
          <Badge
            className={`${getStatusColor()} font-normal shadow-none rounded-md`}
          >
            {getStatusText()}
          </Badge>
        </td>
        <td className="py-4 px-6">{formatDate(loan.disbursementDate)}</td>
        <td className="py-4 px-6">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-deep-blue-500 gap-1 text-sm hover:text-deep-blue-500 hover:bg-gray-100"
              onClick={handleOpenModal}
            >
              <Icons.view className="h-4 w-4" />
              View
            </Button>
          </div>
        </td>
      </tr>

      <PrestaLoanDetailsModal
        loan={loan}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
