"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Eye, EyeOff, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import {
  useForgotPasswordMutation,
  useNewPasswordMutation,
  useResetPasswordMutation,
} from "@/lib/redux/services/auth";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logOut, selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetUserQuery } from "@/lib/redux/services/user";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { withAuth } from "@/components/auth/RequireAuth";

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

interface PasswordRequirement {
  text: string;
  met: boolean;
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements: PasswordRequirement[] = [
    {
      text: "At least 8 characters long",
      met: password.length >= 8,
    },
    {
      text: "At least 1 uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      text: "At least 1 lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      text: "At least 1 number",
      met: /[0-9]/.test(password),
    },
    {
      text: "At least 1 special character from !@#$%^&*",
      met: /[!@#$%^&*]/.test(password),
    },
  ];

  const metRequirements = requirements.filter((req) => req.met).length;
  let strength: "weak" | "medium" | "strong" = "weak";

  if (metRequirements >= 5) {
    strength = "strong";
  } else if (metRequirements >= 3) {
    strength = "medium";
  }

  const strengthColors = {
    weak: "#B71729",
    medium: "#FFAB00",
    strong: "#00CC99",
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(metRequirements / 5) * 100}%`,
                backgroundColor: strengthColors[strength],
              }}
            />
          </div>
          <p
            className="text-sm mt-1 capitalize"
            style={{ color: strengthColors[strength] }}
          >
            {strength}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-5 w-5 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="p-4 max-w-xs bg-gray-200">
              <div className="space-y-2">
                <p className={"text-base text-midnight-blue"}>
                  Password Requirements:
                </p>
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: req.met ? "#00CC99" : "#B71729" }}
                  >
                    <div className="w-4 h-4">{req.met ? "✓" : "✗"}</div>
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

const PasswordSecurity = () => {
  const [step, setStep] = useState<"request" | "code" | "password">("request");
  const [timeLeft, setTimeLeft] = useState(300);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();

  const userId = useAppSelector(selectCurrentToken);
  const { data: user, isLoading } = useGetUserQuery({ guid: userId! });
  const userEmail = user?.personal?.email || "";

  const [forgotPassword, { isLoading: isSendingEmail }] =
    useForgotPasswordMutation();
  const [resetPassword, { isLoading: isVerifyingCode }] =
    useResetPasswordMutation();
  const [newPassword, { isLoading: isSettingPassword }] =
    useNewPasswordMutation();

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRequestReset = async () => {
    try {
      // The API expects an object with an email property
      // Make sure the email is properly formatted and exists
      if (!userEmail || !userEmail.includes("@")) {
        toast.error("Invalid email address");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      await forgotPassword(userEmail).unwrap();
      setStep("code");
      setTimeLeft(300);
      toast.success("Verification code sent to your email");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send verification code");
    }
  };

  const handleVerifyCode = async (values: z.infer<typeof CodeFormSchema>) => {
    try {
      await resetPassword({
        code: values.code,
        guid: userId || "",
      }).unwrap();
      setStep("password");
      toast.success("Code verified successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Invalid verification code");
    }
  };

  const handlePasswordReset = async (
    values: z.infer<typeof PasswordFormSchema>,
  ) => {
    try {
      await newPassword({
        password: values.password,
        personalGuid: userId || "",
      }).unwrap();
      toast.success("Password updated successfully");
      setStep("request");
      passwordForm.reset();
      codeForm.reset();
      // TODO: Confirm logout
      dispatch(logOut());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to update password");
    }
  };

  if (isLoading || !userEmail) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 py-4 md:py-6 px-4 md:px-6">
      <div className="mb-4 md:mb-8 space-y-1 md:space-y-2">
        <h2 className="text-xl md:text-2xl font-medium">Password management</h2>
        <p className="text-sm md:text-base text-gray-600">
          Request a verification code to your registered email to secure your
          password change
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {step === "request" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base">Email</Label>
              <Input
                value={userEmail}
                readOnly
                className="bg-muted h-10 md:h-11"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleRequestReset}
                disabled={isSendingEmail}
                className="w-full md:w-auto px-4 md:px-8 py-2 md:py-2.5 text-sm md:text-base bg-midnight-blue hover:bg-midnight-blue/90"
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "code" && (
          <Form {...codeForm}>
            <form
              onSubmit={codeForm.handleSubmit(handleVerifyCode)}
              className="space-y-4"
            >
              <FormField
                control={codeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter verification code"
                        className="h-10 md:h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                <div className="text-xs md:text-sm">
                  <div className={"flex gap-2 items-center"}>
                    {timeLeft > 0 && (
                      <span>Code expires in {formatTime(timeLeft)}</span>
                    )}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 text-midnight-blue text-xs md:text-sm cursor-pointer hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                      onClick={handleRequestReset}
                      disabled={isSendingEmail || timeLeft > 0}
                    >
                      Resend code
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isCodeFormValid || isVerifyingCode}
                  className="w-full md:w-auto px-4 md:px-8 py-2 md:py-2.5 text-sm md:text-base bg-midnight-blue hover:bg-midnight-blue/90"
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {step === "password" && (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordReset)}
              className="space-y-4 md:space-y-6"
            >
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="h-10 md:h-11"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <PasswordStrengthIndicator password={field.value} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                          className="h-10 md:h-11"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!isPasswordFormValid || isSettingPassword}
                  className="w-full md:w-auto px-4 md:px-8 py-2 md:py-2.5 text-sm md:text-base bg-midnight-blue hover:bg-midnight-blue/90"
                >
                  {isSettingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default withAuth(PasswordSecurity);
