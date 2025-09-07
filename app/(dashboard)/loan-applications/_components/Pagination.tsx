import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generatePageNumbers } from "@/app/(dashboard)/loan-applications/_utils/helpers";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startIndex,
  endIndex,
}) => {
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t">
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1} to {endIndex} of {totalItems} results
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((page, index) =>
          typeof page === "number" ? (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={`h-8 w-8 rounded-md ${
                currentPage === page
                  ? "bg-primary-green hover:bg-primary-green/90 text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="px-1 text-gray-500">
              {page}
            </span>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="sr-only">Next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
