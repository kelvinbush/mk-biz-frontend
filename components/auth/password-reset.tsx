// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useForgotPasswordMutation,
  useNewPasswordMutation,
  useResetPasswordMutation,
} from "@/lib/redux/services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye, EyeOff } from "lucide-react";
import { useFormValidation } from "@/lib/hooks/useFormValidation";

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

const PasswordReset = () => {
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [timeLeft, setTimeLeft] = useState(600);
  const [userEmail, setUserEmail] = useState("");
  const [userGuid, setUserGuid] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPassword, { isLoading: isSendingEmail }] =
    useForgotPasswordMutation();
  const [resetPassword, { isLoading: isVerifyingCode }] =
    useResetPasswordMutation();
  const [newPassword, { isLoading: isSettingPassword }] =
    useNewPasswordMutation();

  const router = useRouter();

  const emailForm = useForm<z.infer<typeof EmailFormSchema>>({
    resolver: zodResolver(EmailFormSchema),
  });

  const codeForm = useForm<z.infer<typeof CodeFormSchema>>({
    resolver: zodResolver(CodeFormSchema),
  });

  const passwordForm = useForm<z.infer<typeof PasswordFormSchema>>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { isValid: isEmailFormValid } = useFormValidation(emailForm);
  const { isValid: isCodeFormValid } = useFormValidation(codeForm);
  const { isValid: isPasswordFormValid } = useFormValidation(passwordForm);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "code" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleEmailSubmit = async (data: z.infer<typeof EmailFormSchema>) => {
    setUserEmail(data.email);
    toast.promise(forgotPassword(data).unwrap(), {
      loading: "Sending reset instructions...",
      success: (response) => {
        setUserGuid(response.guid);
        setStep("code");
        return "Reset instructions sent successfully";
      },
      error: (err) => {
        return err.data?.message || "An error occurred";
      },
    });
  };

  const handleCodeSubmit = (data: z.infer<typeof CodeFormSchema>) => {
    if (!userGuid) {
      toast.error("Session expired. Please try again.");
      return;
    }

    toast.promise(
      resetPassword({
        code: data.code,
        guid: userGuid,
      }).unwrap(),
      {
        loading: "Validating verification code...",
        success: () => {
          setStep("password");
          return "Code verified successfully";
        },
        error: (err) => {
          return err.data?.message || "Invalid verification code";
        },
      },
    );
  };

  const handlePasswordSubmit = (values: z.infer<typeof PasswordFormSchema>) => {
    if (!userGuid) {
      toast.error("Session expired. Please try again.");
      return;
    }

    toast.promise(
      newPassword({
        password: values.password,
        personalGuid: userGuid,
      }).unwrap(),
      {
        loading: "Setting new password...",
        success: () => {
          router.push("/sign-in");
          return "Password reset successfully";
        },
        error: (err) => {
          return err.data?.message || "Failed to set new password";
        },
      },
    );
  };

  const handleResendCode = () => {
    if (userEmail) {
      setTimeLeft(600);
      toast.promise(forgotPassword({ email: userEmail }).unwrap(), {
        loading: "Resending verification code...",
        success: (response) => {
          setUserGuid(response.guid);
          return "New verification code sent";
        },
        error: "Failed to resend code",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const requirements = [
    { label: "8 Char", test: (val: string) => val.length >= 8 },
    {
      label: "1 Uppercase",
      test: (val: string) => /[A-Z]/.test(val),
    },
    { label: "1 Lowercase", test: (val: string) => /[a-z]/.test(val) },
    {
      label: "1 Digit",
      test: (val: string) => /[0-9]/.test(val),
    },
    { label: "1 Special", test: (val: string) => /[^A-Za-z0-9]/.test(val) },
  ];

  // Define password UI requirements at top-level (hooks must not be conditional)
  const watchPassword = passwordForm.watch("password");
  const watchConfirm = passwordForm.watch("confirmPassword");
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
              disabled={!isEmailFormValid || isSendingEmail}
            >
              Send Reset Instructions
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
                disabled={isVerifyingCode || !isCodeFormValid}
              >
                Continue
              </Button>
            </form>
          </Form>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 mt-4">
            <Button
              variant="ghost"
              className="text-primary-green hover:text-primary-green/80 text-sm md:text-base"
              onClick={() => setStep("email")}
            >
              Change email
            </Button>
            <Button
              variant="ghost"
              className="text-primary-green hover:text-primary-green/80 text-sm md:text-base"
              disabled={timeLeft > 0 || isVerifyingCode}
              onClick={handleResendCode}
            >
              Resend Code
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Password step

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
              disabled={isSettingPassword || !isPasswordFormValid}
            >
              Reset Password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PasswordReset;
