"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const EmailFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const CodeFormSchema = z.object({
  code: z.string().min(1, "Verification code is required"),
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must have at least 1 uppercase letter")
  .regex(/[a-z]/, "Must have at least 1 lowercase letter")
  .regex(/[0-9]/, "Must have at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Must have at least 1 special character");

const PasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof EmailFormSchema>;
type CodeFormValues = z.infer<typeof CodeFormSchema>;
type PasswordFormValues = z.infer<typeof PasswordFormSchema>;

const PasswordReset = () => {
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [timeLeft, setTimeLeft] = useState(600);
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isLoaded, signIn } = useSignIn();

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Code verification form
  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(CodeFormSchema),
    defaultValues: {
      code: "",
    },
  });

  // New password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Form validation states
  const isEmailFormValid = emailForm.formState.isValid;
  const isCodeFormValid = codeForm.formState.isValid;
  const isPasswordFormValid = passwordForm.formState.isValid;

  // Timer for code expiration
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (step === "code") {
      // Set up the timer when entering the code step
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    // Clean up the timer when the component unmounts or when the step changes
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step]); // Only depend on step changes

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Password requirements
  const requirements = [
    { label: "8 Char", test: (val: string) => val.length >= 8 },
    { label: "1 Uppercase", test: (val: string) => /[A-Z]/.test(val) },
    { label: "1 Lowercase", test: (val: string) => /[a-z]/.test(val) },
    { label: "1 Digit", test: (val: string) => /[0-9]/.test(val) },
    { label: "1 Special", test: (val: string) => /[^A-Za-z0-9]/.test(val) },
  ];

  // Watch password fields for UI validation
  const watchPassword = passwordForm.watch("password");
  const watchConfirm = passwordForm.watch("confirmPassword");
  
  // UI requirements with password match check
  const uiRequirements = useMemo(
    () => [
      ...requirements,
      {
        label: "Match",
        test: () =>
          watchPassword.length > 0 &&
          watchConfirm.length > 0 &&
          watchPassword === watchConfirm,
      },
    ],
    [requirements, watchPassword, watchConfirm],
  );

  // Handle email submission
  const handleEmailSubmit = async (values: EmailFormValues) => {
    if (!isLoaded || !signIn) {
      toast.error("Authentication system is not ready");
      return;
    }

    try {
      setIsLoading(true);
      setUserEmail(values.email);

      // Start the password reset process with Clerk
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: values.email,
      });

      // Move to code verification step
      setStep("code");
      setTimeLeft(600); // Reset timer to 10 minutes
      toast.success("Reset instructions sent successfully");
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      let errorMessage = "Failed to send reset instructions";
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code verification
  const handleCodeSubmit = async (values: CodeFormValues) => {
    if (!isLoaded || !signIn) {
      toast.error("Authentication system is not ready");
      return;
    }

    try {
      setIsLoading(true);

      // Attempt to verify the code
      await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: values.code,
      });

      // Move to password reset step
      setStep("password");
      toast.success("Code verified successfully");
    } catch (err: any) {
      console.error("Code verification error:", err);
      
      let errorMessage = "Invalid verification code";
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (!isLoaded || !signIn) {
      toast.error("Authentication system is not ready");
      return;
    }

    try {
      setIsLoading(true);

      // Reset the password
      await signIn.resetPassword({
        password: values.password,
      });

      // Show success message
      toast.success("Password reset successfully");
      
      // Use a more reliable navigation approach
      console.log("Password reset successful, redirecting to home page...");
      setIsLoading(false); // Make sure to unset loading state first
      
      // Try multiple navigation approaches
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
      
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      let errorMessage = "Failed to reset password";
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message || errorMessage;
      }
      
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (!isLoaded || !signIn || !userEmail) {
      toast.error("Cannot resend code at this time");
      return;
    }

    try {
      setIsLoading(true);

      // Resend the verification code
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: userEmail,
      });

      setTimeLeft(600); // Reset timer to 10 minutes
      toast.success("New verification code sent");
    } catch (err: any) {
      console.error("Resend code error:", err);
      
      let errorMessage = "Failed to resend code";
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="w-full rounded-lg bg-white p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-green border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  // Email step
  if (step === "email") {
    return (
      <div className="flex flex-col justify-center gap-2 p-4 md:p-9 text-center font-medium text-midnight-blue w-full max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold leading-normal tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-lg md:text-2xl font-normal tracking-tight">
          Please enter your email address and we&apos;ll send you a verification
          code
        </p>
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
            className="mt-6 md:mt-8 space-y-6 md:space-y-8 w-full mx-auto"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="janedoe@email.com"
                      {...field}
                      className="h-11 md:h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full h-11 md:h-12 text-base"
              size="lg"
              type="submit"
              disabled={!isEmailFormValid || isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </Button>
          </form>
        </Form>
        <Link
          className="font-medium text-primary-green underline mt-4 text-sm md:text-base"
          href="/sign-in"
        >
          Back to Sign in
        </Link>
      </div>
    );
  }

  // Code verification step
  if (step === "code") {
    return (
      <div className="flex flex-col">
        <div className="flex flex-1 flex-col justify-center gap-2 p-4 md:p-9 text-center font-medium text-midnight-blue">
          <img
            src="/images/check-mail.gif"
            alt="Email Icon"
            className="mx-auto mb-4 h-32 md:h-48 w-32 md:w-48"
          />
          <h1 className="text-2xl md:text-4xl font-bold leading-normal">
            Check your email
          </h1>
          <p className="text-lg md:text-2xl font-normal">
            Please enter the verification code that was sent to your email{" "}
            <span className="text-lg md:text-2xl font-medium text-primary-green">
              {userEmail.replace(/(.{3}).*(@.*)/, "$1***$2")}
            </span>
          </p>
          <Form {...codeForm}>
            <form
              onSubmit={codeForm.handleSubmit(handleCodeSubmit)}
              className="mt-6 md:mt-8 space-y-6 md:space-y-8 w-full mx-auto"
            >
              <FormField
                control={codeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormControl>
                      <Input
                        placeholder="******"
                        {...field}
                        className="text-center h-11 md:h-12 text-base"
                      />
                    </FormControl>
                    <FormDescription className="text-midnight-blue text-sm md:text-base">
                      Code expires in{" "}
                      <span className="text-pink-500">
                        {formatTime(timeLeft)}
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full h-11 md:h-12 text-base"
                size="lg"
                type="submit"
                disabled={isLoading || !isCodeFormValid}
              >
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </form>
          </Form>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 mt-4">
            <Button
              variant="ghost"
              className="text-primary-green hover:text-primary-green/80 text-sm md:text-base"
              onClick={() => setStep("email")}
              disabled={isLoading}
            >
              Change email
            </Button>
            <Button
              variant="ghost"
              className="text-primary-green hover:text-primary-green/80 text-sm md:text-base"
              disabled={isLoading}
              onClick={handleResendCode}
            >
              Resend Code
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Password reset step
  return (
    <div className="flex flex-col justify-center gap-2 p-4 md:p-9 text-midnight-blue">
      <div className="text-center">
        <h1 className="mb-2 text-2xl md:text-4xl font-bold">Create new password</h1>
        <p className="mb-4 md:mb-6 text-lg md:text-2xl">
          Your password must be different from your previously used passwords
        </p>
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="space-y-4 md:space-y-6 w-full mx-auto"
          >
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel className="text-sm md:text-base" required>New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                        className="h-11 md:h-12 text-base"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel className="text-sm md:text-base" required>Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        className="h-11 md:h-12 text-base"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-3 lg:grid-cols-6">
              {uiRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center rounded-md border p-1 md:p-2 text-center text-xs md:text-sm shadow-lg ${req.test(watchPassword) ? "border-green-500 text-green-500" : "border-gray-300 text-gray-500"}`}
                >
                  {req.test(watchPassword) && (
                    <Check className="mb-1 h-3 md:h-4 w-3 md:w-4" />
                  )}
                  {req.label}
                  <p className="text-[8px] md:text-[10px]">
                    {req.label === "8 Char"
                      ? "Must be at least 8 characters long"
                      : req.label === "1 Special"
                        ? "Must have at least 1 special character"
                        : req.label === "Match"
                          ? "Passwords must match"
                          : `Must have at least 1 ${req.label.toLowerCase().replace("1 ", "")}`}
                  </p>
                </div>
              ))}
            </div>
            <Button
              type="submit"
              className="w-full h-11 md:h-12 text-base mt-4"
              disabled={isLoading || !isPasswordFormValid}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PasswordReset;
