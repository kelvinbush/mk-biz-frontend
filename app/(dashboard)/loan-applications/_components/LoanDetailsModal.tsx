import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoanApplicationResponse } from "../_utils/types";
import { getStatusColor } from "../_utils/helpers";
import { AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface LoanDetailsModalProps {
  loan: LoanApplicationResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({
  loan,
  isOpen,
  onClose,
}) => {
  if (!loan) return null;

  const getStatusText = (status: number): string => {
    switch (status) {
      case 1:
        return "Approved";
      case 0:
        return "Pending review";
      case 3:
        return "Rejected";
      case 4:
        return "Disbursed";
      default:
        return "Unknown";
    }
  };

  const formatApplicationDate = () => {
    if (loan.createdDate) {
      try {
        return format(new Date(loan.createdDate), "MMMM dd, yyyy");
      } catch (error) {
        console.error(error);
        return "Not available";
      }
    }
    return "Not available";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle className="text-4xl font-medium">
              Loan Application Details
            </DialogTitle>
            <Separator
              orientation="vertical"
              className="h-7 w-0.5 bg-[#151F28]"
            />
            <p className={"text-xl text-[#444C53]"}>Status:</p>
            <Badge
              className={`${getStatusColor(loan.loanStatus)} font-normal shadow-none rounded-md`}
            >
              {getStatusText(loan.loanStatus)}
            </Badge>
          </div>
        </DialogHeader>
        <div className="mt-0.5">
          <p className="text-[#444C53] mb-1 text-2xl">
            Review and confirm your loan application details below
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-gray-600 mb-1">Loan amount</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={loan.loanAmount}
                  readOnly
                  className="flex-1 p-3 rounded-l-md outline-none"
                />
                <div className="bg-gray-100 flex items-center px-4 rounded-r-md">
                  <span className="font-medium">{loan.defaultCurrency || "KES"}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-1">Loan tenure</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={loan.repaymentPeriod}
                  readOnly
                  className="flex-1 p-3 rounded-l-md outline-none"
                />
                <div className="bg-gray-100 flex items-center px-4 rounded-r-md">
                  <span className="font-medium">months</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-1">Interest rate</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={loan.interestRate}
                  readOnly
                  className="flex-1 p-3 rounded-l-md outline-none"
                />
                <div className="bg-gray-100 flex items-center px-4 rounded-r-md">
                  <span className="font-medium">%</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-1">Application date</p>
              <div className="flex border rounded-md">
                <input
                  type="text"
                  value={formatApplicationDate()}
                  readOnly
                  className="flex-1 p-3 rounded-md outline-none"
                />
              </div>
            </div>

            <div className="mb-4 col-span-1 md:col-span-2">
              <p className="text-gray-600 mb-1">Intended use of funds</p>
              <textarea
                value={
                  loan.loanPurpose ||
                  "To purchase more solar panels for my business"
                }
                readOnly
                className="w-full p-3 border rounded-md outline-none resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">0/100</span>
              </div>
            </div>

            {loan.loanStatus === 3 && (
              <div className="mb-4 col-span-1 md:col-span-2">
                <div className="flex items-center mb-1">
                  <AlertTriangle className="h-4 w-4 text-[#B71729] mr-2" />
                  <p className="text-gray-600 font-medium">Rejection reason</p>
                </div>
                <div className="border border-[#E9B7BD] rounded-md p-1 bg-[#FFF5F5]">
                  <textarea
                    value={
                      loan.rejectionReason ||
                      "Insufficient business funding requirements"
                    }
                    readOnly
                    className="w-full p-3 rounded-md outline-none resize-none bg-white border border-[#E9B7BD]"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">0/100</span>
                </div>
              </div>
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
