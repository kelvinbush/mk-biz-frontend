"use client";

import { usePathname, useRouter } from "next/navigation";
import { useGetUserQuery } from "@/lib/redux/services/user";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

const LoadingState = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Image
          src="/mk-logo.png"
          alt="Melanin Kapital Logo"
          width={60}
          height={60}
          className="animate-pulse"
        />
        <div className="absolute inset-0 animate-spin-slow">
          <div className="h-full w-full rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm">Loading your profile...</p>
      </div>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => {
  const router = useRouter();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          <button
            onClick={() => router.push("/sign-in")}
            className="mt-2 w-full rounded-md bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
          >
            Try Again
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const pathname = usePathname();
    const fallbackToken =
      typeof window !== "undefined" ? localStorage.getItem("userGuid") : null;
    const {
      data: userResponse,
      error,
      isLoading,
    } = useGetUserQuery({ guid: fallbackToken! }, { skip: !fallbackToken });

    // If no token, redirect to sign in immediately
    if (!fallbackToken) {
      router.replace("/sign-in");
      return <LoadingState />;
    }

    // Show loading state while fetching user data
    if (isLoading) {
      return <LoadingState />;
    }

    // Handle API errors
    if (error) {
      return (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : "We're having trouble loading your profile. Please try again."
          }
        />
      );
    }

    // Only proceed if we have user data
    if (userResponse?.personal) {
      const {
        verifiedEmail,
        business,
        identityDocType,
        identityDocNumber,
        taxIdNumber,
      } = userResponse.personal;

      // Determine the correct redirect path based on verification status
      let redirectPath = null;

      if (!verifiedEmail) {
        redirectPath = "/verify-email";
      } else if (!business) {
        redirectPath = "/set-business";
      } else if (
        identityDocNumber === "" ||
        identityDocType === "" ||
        taxIdNumber === ""
      ) {
        if (pathname !== "/verify-identity") {
          redirectPath = "/verify-identity";
        }
      }

      // If we need to redirect, do it without showing the dashboard
      if (redirectPath) {
        router.replace(redirectPath);
        return <LoadingState />;
      }

      // If all verifications are complete, render the protected component
      return <WrappedComponent {...props} />;
    }

    // Fallback loading state if we somehow don't have user data
    return <LoadingState />;
  };
}
