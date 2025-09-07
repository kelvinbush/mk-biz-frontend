import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusFilterDropdownProps {
  filterStatus: string;
  setFilterStatus: (value: string) => void;
}

export const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({
  filterStatus,
  setFilterStatus,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-[#E8E9EA] py-2 px-4 h-12 w-max"
        >
          <Icons.filter className="h-6 w-6" />
          {filterStatus === "all"
            ? "All Applications"
            : filterStatus.charAt(0).toUpperCase() +
              filterStatus.slice(1) +
              " Applications"}
          <ChevronDown className={"h-6 w-6"} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={filterStatus} onValueChange={setFilterStatus}>
          <DropdownMenuRadioItem value="all">
            All Applications
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pending">
            Applied
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="review">
            Review
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="approved">
            Approved
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="rejected">
            Rejected
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
