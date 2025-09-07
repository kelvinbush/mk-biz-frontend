import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const generatePaginationNumbers = (currentPage: number, totalPages: number) => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  range.push(1);

  if (totalPages <= 1) return range;

  for (let i = currentPage - delta; i <= currentPage + delta; i++) {
    if (i < totalPages && i > 1) {
      range.push(i);
    }
  }
  range.push(totalPages);

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

export default function Pagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-t gap-3 md:gap-0">
      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-700">
        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
        {totalItems} results
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 min-w-[2rem]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {generatePaginationNumbers(currentPage, totalPages).map((pageNum, index) => (
            <Button
              key={index}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() =>
                typeof pageNum === "number" && onPageChange(pageNum)
              }
              disabled={pageNum === "..."}
              className={cn(
                "h-8 w-8 p-0 min-w-[2rem]",
                pageNum === currentPage &&
                  "bg-gradient-to-r from-[#8AF2F2] to-[#54DDBB] text-midnight-blue hover:from-[#8AF2F2] hover:to-[#54DDBB] hover:text-midnight-blue",
                pageNum === "..." &&
                  "cursor-default hover:bg-transparent"
              )}
            >
              {pageNum}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 min-w-[2rem]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
