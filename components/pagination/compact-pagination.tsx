"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CompactPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // pages to show on each side of current
  boundaryCount?: number; // pages to show at the start and end
  className?: string;
}

const DOTS = "…";

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number,
): (number | string)[] {
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3; // first, last, current

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - (boundaryCount + 1);

  const firstPages = range(1, boundaryCount);
  const lastPages = range(totalPages - boundaryCount + 1, totalPages);

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = range(1, rightSiblingIndex + (boundaryCount + 1 - currentPage + siblingCount));
    return [...leftRange, DOTS, ...lastPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightRange = range(leftSiblingIndex - (boundaryCount + siblingCount - currentPage + 1), totalPages);
    return [...firstPages, DOTS, ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [...firstPages, DOTS, ...middleRange, DOTS, ...lastPages];
  }

  return range(1, totalPages);
}

const CompactPagination: React.FC<CompactPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  className = "",
}) => {
  const pages = getPaginationRange(currentPage, totalPages, siblingCount, boundaryCount);

  const goToPage = (page: number) => {
    const p = Math.min(Math.max(page, 1), totalPages);
    if (p !== currentPage) onPageChange(p);
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 md:h-10 md:w-10"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((item, idx) =>
        item === DOTS ? (
          <span key={`dots-${idx}`} className="px-2 text-xs md:text-sm text-muted-foreground">
            {DOTS}
          </span>
        ) : (
          <Button
            key={item as number}
            variant={currentPage === item ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10"
            onClick={() => goToPage(item as number)}
            aria-current={currentPage === item ? "page" : undefined}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 md:h-10 md:w-10"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CompactPagination;
