import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogoutModal } from "@/context/logout-modal-context";
import { useUser } from "@clerk/nextjs";

export function UserNav() {
  const router = useRouter();
  const { showLogoutModal } = useLogoutModal();
  const { user } = useUser();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex cursor-pointer items-center gap-2 text-left"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user?.imageUrl || ""}
              alt={user?.fullName || ""}
            />
            <AvatarFallback>
              {getInitials(
                `${user?.fullName || ""}`,
              )}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-sm font-medium text-midnight-blue">
            <p>{`${user?.firstName} ${user?.lastName}`}</p>
            <p className="font-normal text-primaryGrey-200">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </p>
          </div>
          <ChevronDown size={16} className="hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem
          onClick={() => {
            router.push("/my-profile");
          }}
        >
          My Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={showLogoutModal}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
