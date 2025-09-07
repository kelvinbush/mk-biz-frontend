import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { X } from "lucide-react";

interface EmptyStateProps {
  hasDocuments: boolean;
  hasFilters: boolean;
  onReset: () => void;
}

export const EmptyState = ({
  hasDocuments,
  hasFilters,
  onReset,
}: EmptyStateProps) => {
  if (!hasDocuments) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
        <Icons.emptyFunds className="h-24 w-24 md:h-32 md:w-32 mb-4 md:mb-6 text-gray-400" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
          No Documents Available
        </h3>
        <p className="text-sm md:text-base text-gray-500">
          Upload your company documents to get started.
        </p>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
        <Icons.emptyFunds className="h-24 w-24 md:h-32 md:w-32 mb-4 md:mb-6 text-gray-400" />
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
          No documents found
        </h3>
        <p className="text-sm md:text-base text-gray-500">
          Try adjusting your filters or search terms.
        </p>
        <Button
          variant="outline"
          onClick={onReset}
          className="mt-4 flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-sm md:text-base h-10 md:h-12"
        >
          Reset Filters
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return null;
};
