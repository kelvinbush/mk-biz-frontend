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
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetUserQuery } from "@/lib/redux/services/user";
import { useLogoutModal } from "@/context/logout-modal-context";

export function UserNav() {
  const router = useRouter();
  const userId = useAppSelector(selectCurrentToken);
  const { showLogoutModal } = useLogoutModal();
  const { data: user, isLoading, error } = useGetUserQuery({ guid: userId! });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        Error loading profile
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex cursor-pointer items-center gap-2 text-left"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.personal.profilePhoto}
              alt={user.personal.firstName}
            />
            <AvatarFallback>
              {getInitials(
                `${user.personal.firstName} ${user.personal.lastName}`,
              )}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-sm font-medium text-midnight-blue">
            <p>{`${user.personal.firstName} ${user.personal.lastName}`}</p>
            <p className="font-normal text-primaryGrey-200">
              {user.personal.email}
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
