export const getStatusColor = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: "bg-[#E1EFFE] text-[#1E429F] hover:bg-[#E1EFFE] hover:text-[#1E429F]", // Applied
    1: "bg-[#FFE5B0] text-[#8C5E00] hover:bg-[#FFE5B0] hover:text-[#8C5E00]", // Review
    2: "bg-[#B0EFDF] text-[#007054] hover:bg-[#B0EFDF] hover:text-[#007054]", // Approved
    3: "bg-[#E9B7BD] text-[#650D17] hover:bg-[#E9B7BD] hover:text-[#650D17]", // Rejected
  };
  return statusMap[status] || "";
};

export const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
) => {
  // Show all pages if total pages <= 5
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Always show first and last page
  const pages = [1, totalPages];

  // Calculate range around current page
  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  // Add range to pages
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Sort pages
  pages.sort((a, b) => a - b);

  // Add ellipses
  const result = [];
  for (let i = 0; i < pages.length; i++) {
    result.push(pages[i]);

    // Add ellipsis if there's a gap
    if (i < pages.length - 1 && pages[i + 1] - pages[i] > 1) {
      result.push("...");
    }
  }

  return result;
};
