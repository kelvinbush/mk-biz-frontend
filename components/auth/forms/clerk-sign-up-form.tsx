"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "react-phone-input-2/lib/style.css";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSignUp } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import PhoneInput from "react-phone-input-2";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number is required"),
    gender: z.string().min(1, "Gender is required"),
    birthDate: z
      .string()
      .min(1, "Date of birth is required")
      .refine((date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      }, "Invalid date of birth")
      .refine((date) => {
        const d = new Date(date);
        const today = new Date();
        d.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return d <= today;
      }, "Birth date cannot be in the future")
      .refine((date) => {
        const d = new Date(date);
        const min = new Date(1900, 0, 1);
        return d >= min;
      }, "Please enter a realistic date of birth")
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        return age >= 18 && age <= 120;
      }, "You must be between 18 and 120 years old"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val, "You must agree to the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const verificationSchema = z.object({
  code: z.string().min(6, "Please enter the 6-digit code"),
});

type SignUpFormValues = z.infer<typeof formSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;

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

// Email Verification Component
function EmailVerification({
  email,
  onVerificationSuccess,
  onResendCode,
  isLoading,
  setIsLoading
}: {
  email: string;
  onVerificationSuccess: () => void;
  onResendCode: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const { signUp, setActive } = useSignUp();
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [isResending, setIsResending] = useState(false);

  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  // Countdown timer
  useState(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const onVerificationSubmit = async (data: VerificationFormValues) => {
    if (!signUp) return;

    try {
      setIsLoading(true);

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        onVerificationSuccess();
        toast.success("Email verified successfully! Welcome aboard!");
      } else {
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const errorMessage = err.errors?.[0]?.message || "Invalid verification code";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    try {
      setIsResending(true);
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCountdown(600); // Reset countdown
      onResendCode();
      toast.success("Verification code sent!");
    } catch (err: any) {
      console.error("Resend error:", err);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full rounded-lg bg-white">
      <div className="mb-6 md:mb-10 text-center">
        <img
          src="/images/check-mail.gif"
          alt="Email verification"
          className="mx-auto mb-4 h-24 w-24 md:h-32 md:w-32"
        />
        <p className="text-sm font-medium uppercase text-primary-green">
          Step 2/3
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-midnight-blue">
          Verify your email
        </h2>
        <p className="mt-2 text-lg md:text-2xl text-midnight-blue">
          We sent a verification code to{" "}
          <span className="text-primary-green font-medium">{email}</span>
        </p>
      </div>

      <Form {...verificationForm}>
        <form
          onSubmit={verificationForm.handleSubmit(onVerificationSubmit)}
          className="space-y-6"
        >
          <FormField
            control={verificationForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base">
                  Enter 6-digit verification code
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="000000"
                    {...field}
                    className="h-11 md:h-12 text-base text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 md:h-14 text-base"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm md:text-base">
        <p>
          Code expires in{" "}
          <span className="text-pink-500 font-medium">{formatTime(countdown)}</span>
        </p>
        <p>
          Didn&apos;t receive the code?{" "}
          <Button
            variant="ghost"
            className="p-0 h-auto text-primary-green underline hover:bg-transparent hover:text-primary-green/80"
            disabled={isResending || countdown > 0}
            onClick={handleResendCode}
          >
            {isResending ? "Sending..." : "Resend code"}
          </Button>
        </p>
      </div>
    </div>
  );
}

export function ClerkSignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<"signup" | "verification">("signup");
  const [userEmail, setUserEmail] = useState("");
  const { isLoaded, signUp } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      birthDate: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
    mode: "onChange",
  });

  async function onSubmit(values: SignUpFormValues) {
    if (!isLoaded || !signUp) {
      toast.error("Please wait, authentication is loading...");
      return;
    }

    try {
      setIsLoading(true);

      // Create the user account with Clerk
      await signUp.create({
        emailAddress: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        unsafeMetadata: {
          gender: values.gender,
          phoneNumber: values.phoneNumber,
          dob: values.birthDate,
        },
      });

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      });

      // Store email and move to verification step
      setUserEmail(values.email);
      setCurrentStep("verification");

      toast.success("Account created! Please check your email for verification code.");
    } catch (err: any) {
      console.error("Sign-up error:", err);

      let errorMessage = "Failed to create account. Please try again.";

      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0];

        // Handle specific error cases
        if (error.code === "form_identifier_exists") {
          errorMessage = "An account with this email already exists. Please try signing in instead.";
        } else if (error.code === "form_password_pwned") {
          errorMessage = "This password has been compromised. Please choose a different password.";
        } else if (error.code === "form_password_validation") {
          errorMessage = "Password doesn't meet requirements. Please check the password criteria.";
        } else {
          errorMessage = error.message || errorMessage;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerificationSuccess = () => {
    // Redirect to dashboard or next step
    router.push("/");
  };

  const handleResendCode = () => {
    toast.success("Verification code sent to " + userEmail);
  };

  if (!isLoaded) {
    return (
      <div className="w-full rounded-lg bg-white p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-green border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  // Show verification step
  if (currentStep === "verification") {
    return (
      <EmailVerification
        email={userEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onResendCode={handleResendCode}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    );
  }

  // Show signup form
  return (
    <div className="w-full rounded-lg bg-white">
      <div className="mb-6 md:mb-10">
        <p className="text-sm font-medium uppercase text-primary-green">
          Step 1/3
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-midnight-blue">
          Create your account
        </h2>
        <p className="mt-2 text-lg md:text-2xl text-midnight-blue">
          Let&apos;s get you set up and make you feel right at{" "}
          <span className="text-pink-500">home</span>
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-sm md:text-base" required>First name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    {...field}
                    className="h-11 md:h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base" required>Last name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    {...field}
                    className="h-11 md:h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base" required>
                  Email (Work email is preferred, if available)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    {...field}
                    className="h-11 md:h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base" required>Phone number</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    country="ke"
                    countryCodeEditable={false}
                    value={value?.replace(/^\+/, "")}
                    onChange={(phone) => {
                      const cleanedPhone = phone.replace(/^(\d{3})0/, "$1");
                      onChange(`+${cleanedPhone}`);
                    }}
                    inputClass="!w-full !h-11 md:!h-12 !text-base"
                    buttonClass="!h-11 md:!h-12"
                    containerClass="!w-full"
                    enableSearch
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base" required>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 md:h-12 text-base">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base" required>Date of birth</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="date"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      e.target.type = "text";
                      if (field.value) {
                        const date = new Date(field.value);
                        e.target.value = format(date, "dd/MM/yyyy");
                      }
                    }}
                    value={
                      field.value
                        ? format(new Date(field.value), "yyyy-MM-dd")
                        : ""
                    }
                    placeholder="DD/MM/YYYY"
                    className="block h-11 md:h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base" required>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="h-11 md:h-12 text-base"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <PasswordStrengthIndicator password={field.value} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base" required>Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      className="h-11 md:h-12 text-base"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agreeTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-1 md:col-span-2 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal text-sm md:text-base">
                    I agree to the{" "}
                    <Link
                      href="https://pjccitj0ny.ufs.sh/f/ewYz0SdNs1jLsw0JXtTaSljhRqXr6mBuJN1opUPFeKbcZg3k"
                      target={"_blank"}
                      className="font-medium text-primary-green capitalize underline"
                    >
                      terms of service
                    </Link>{" "}
                    and{" "}
                    <Link
                      target={"_blank"}
                      href="https://pjccitj0ny.ufs.sh/f/ewYz0SdNs1jLvFVCntHCgvpe94FiSQ72Z3oc8WVDqNGKtasB"
                      className="font-medium text-primary-green capitalize underline"
                    >
                      privacy policy
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full col-span-1 md:col-span-2 h-12 md:h-14 text-base mt-4"
            disabled={isLoading}
            size={"lg"}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-gray-600 text-sm md:text-base">
        Already have an account?{" "}
        <Link
          href={"/sign-in"}
          className="font-medium text-primary-green underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}