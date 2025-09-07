import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { LoanApplicationResponse } from "../_utils/types";
import { getStatusColor } from "../_utils/helpers";
import { LoanDetailsModal } from "./LoanDetailsModal";
import CancelModal from "@/app/(dashboard)/loan-applications/_components/cancel-modal";
import { format } from "date-fns";

interface LoanApplicationRowProps {
  loan: LoanApplicationResponse;
}

export const LoanApplicationRow: React.FC<LoanApplicationRowProps> = ({
  loan,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Format the application date if available
  const formatApplicationDate = () => {
    if (loan.createdDate) {
      try {
        return format(new Date(loan.createdDate), "MMM dd, yyyy");
      } catch (error) {
        console.error(error);
        return "N/A";
      }
    }
    return "N/A";
  };

  return (
    <>
      <tr key={loan.loanApplicationGuid} className="hover:bg-[#E6FAF5]">
        <td className="py-4 px-6">
          <div>
            <p className="font-medium">{loan.loanProductName}</p>
          </div>
        </td>
        <td className="py-4 px-6">
          {loan.defaultCurrency ? `${loan.defaultCurrency} ` : "KES "}
          {loan.loanAmount}
        </td>
        <td className="py-4 px-6">{loan.repaymentPeriod}</td>
        <td className="py-4 px-6">
          <Badge
            className={`${getStatusColor(loan.loanStatus)} font-normal shadow-none rounded-md`}
          >
            {loan.loanStatus === 0
              ? "Applied"
              : loan.loanStatus === 1
                ? "Review"
                : loan.loanStatus === 2
                  ? "Approved"
                  : loan.loanStatus === 3
                    ? "Rejected"
                    : "Unknown"}
          </Badge>
        </td>
        <td className="py-4 px-6">{formatApplicationDate()}</td>
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
            <Button
              size="sm"
              variant="ghost"
              disabled={loan.loanStatus === 1 || loan.loanStatus === 3}
              onClick={() => setIsCancelModalOpen(true)}
              className="text-[#B71729] gap-1 text-sm hover:text-[#B71729] hover:bg-gray-100"
            >
              <Icons.cancelIcon className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </td>
      </tr>

      <LoanDetailsModal
        loan={loan}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      <CancelModal
        isOpen={isCancelModalOpen}
        setIsOpen={setIsCancelModalOpen}
      />
    </>
  );
};
