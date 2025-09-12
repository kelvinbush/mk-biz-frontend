import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/verify-email(.*)",
  "/check-email(.*)",
  "/forgot-password(.*)",
]);

const isPhoneVerificationRoute = createRouteMatcher(["/verify-phone(.*)"]);
const isBusinessSetupRoute = createRouteMatcher(["/set-business(.*)"]);
const isIdentityVerificationRoute = createRouteMatcher(["/verify-identity(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth();

  // Allow access to phone verification route if authenticated
  if (isAuthenticated && isPhoneVerificationRoute(req)) {
    return NextResponse.next();
  }

  // Allow access to business setup route if authenticated and phone is verified
  if (isAuthenticated && isBusinessSetupRoute(req) && sessionClaims?.metadata?.isPhoneVerified) {
    return NextResponse.next();
  }

  // Allow access to identity verification route if authenticated, phone is verified, and onBoardingStage is 0
  if (
    isAuthenticated &&
    isIdentityVerificationRoute(req) &&
    sessionClaims?.metadata?.isPhoneVerified &&
    sessionClaims?.metadata?.onBoardingStage === 0
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign in for protected routes
  if (!isAuthenticated && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Handle onboarding flow based on verification status and onboarding stage
  if (isAuthenticated) {
    const isPhoneVerified = sessionClaims?.metadata?.isPhoneVerified;
    const onBoardingStage = sessionClaims?.metadata?.onBoardingStage;

    // First priority: Phone verification
    if (!isPhoneVerified && !isPhoneVerificationRoute(req)) {
      const phoneVerificationUrl = new URL("/verify-phone", req.url);
      return NextResponse.redirect(phoneVerificationUrl);
    }

    // If phone is verified, check onboarding stage
    if (isPhoneVerified) {
      // If onBoardingStage is null or undefined, redirect to business setup
      if (onBoardingStage === null || onBoardingStage === undefined) {
        if (!isBusinessSetupRoute(req)) {
          const businessSetupUrl = new URL("/set-business", req.url);
          return NextResponse.redirect(businessSetupUrl);
        }
      }

      // If onBoardingStage is 0, redirect to identity verification
      if (onBoardingStage === 0 && !isIdentityVerificationRoute(req)) {
        const identityVerificationUrl = new URL("/verify-identity", req.url);
        return NextResponse.redirect(identityVerificationUrl);
      }
    }
  }

  // Allow access to protected routes if all conditions are met
  if (isAuthenticated && !isPublicRoute(req)) {
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};