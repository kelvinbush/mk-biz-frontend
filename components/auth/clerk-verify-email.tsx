import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FormSchema = z.object({
  code: z.string().min(1),
});

const EmailFormSchema = z.object({
  email: z.string().email(),
});

// Default to 10 minutes (600 seconds) - Clerk's default expiration time
const COUNTDOWN_TIME = 600;

const VerifyEmail = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isEditing, setIsEditing] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [email, setEmail] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const emailForm = useForm<z.infer<typeof EmailFormSchema>>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: {
      email: email,
    },
  });

  const router = useRouter();

  // Get the current email from Clerk's signUp object
  useEffect(() => {
    if (isLoaded && signUp) {
      const pendingEmail = signUp.emailAddress;
      if (pendingEmail) {
        setEmail(pendingEmail);
        emailForm.setValue("email", pendingEmail);
      }
    }
  }, [isLoaded, signUp, emailForm]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountdownActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }
    return () => clearInterval(timer);
  }, [countdown, isCountdownActive]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!isLoaded || !signUp) {
      toast.error("Authentication system is not ready");
      return;
    }

    try {
      setIsLoading(true);
      
      // Attempt to verify the email with the provided code
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (completeSignUp.status !== "complete") {
        // Handle any errors or incomplete status
        toast.error("Verification failed. Please try again.");
        return;
      }

      // Set the user session as active
      await setActive({ session: completeSignUp.createdSessionId });
      
      // Redirect to the dashboard or next step
      router.push("/dashboard");
      toast.success("Email verified successfully");
    } catch (err: any) {
      console.error("Error during email verification:", err);
      toast.error(err?.errors?.[0]?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !signUp) {
      toast.error("Authentication system is not ready");
      return;
    }

    try {
      setIsResending(true);
      
      // Resend the verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      // Reset the countdown
      setCountdown(COUNTDOWN_TIME);
      setIsCountdownActive(true);
      
      toast.success("Code sent successfully");
    } catch (err: any) {
      console.error("Error resending verification code:", err);
      toast.error(err?.errors?.[0]?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailUpdate = async (data: z.infer<typeof EmailFormSchema>) => {
    if (!isLoaded || !signUp) {
      toast.error("Authentication system is not ready");
      return;
    }

    try {
      setIsUpdating(true);
      
      // Update the email address in Clerk
      await signUp.update({ emailAddress: data.email });
      
      // Prepare verification for the new email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      setEmail(data.email);
      setIsEditing(false);
      
      // Reset the countdown for the new code
      setCountdown(COUNTDOWN_TIME);
      setIsCountdownActive(true);
      
      toast.success("Email updated successfully");
    } catch (err: any) {
      console.error("Error updating email:", err);
      toast.error(err?.errors?.[0]?.message || "Failed to update email");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded || !signUp) {
    return <div>Loading...</div>;
  }

  return (
    <div className={"text-center px-4 md:px-0"}>
      <img
        src="/images/check-mail.gif"
        alt="Email Icon"
        className={"mx-auto mb-4 h-32 md:h-48 w-32 md:w-48"}
      />
      <h1 className={"text-2xl md:text-4xl font-bold leading-normal"}>
        Verify your email address
      </h1>
      <p className={"text-lg md:text-2xl font-normal"}>
        Please enter the verification code that was sent to your email{" "}
        <span
          className={
            "text-lg md:text-2xl font-medium text-primary-green inline-flex items-center gap-2"
          }
        >
          {email}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">Update Email Address</DialogTitle>
              </DialogHeader>
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(handleEmailUpdate)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Enter new email" {...field} className="h-11 md:h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdating} className="h-11 md:h-12 w-full md:w-auto">
                    Update Email
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </span>
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={"mt-6 md:mt-8 space-y-6 md:space-y-8 w-full mx-auto"}
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className={"text-left"}>
                <FormControl>
                  <Input
                    placeholder="******"
                    {...field}
                    className={"text-center h-11 md:h-12 text-base"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className={"w-full h-11 md:h-12 text-base"}
            size={"lg"}
            type="submit"
            disabled={isResending || isLoading}
          >
            {isLoading ? "Verifying email..." : "Verify email"}
          </Button>
        </form>
      </Form>
      <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 text-sm md:text-base">
        <p className="mt-2">
          Code expires in{" "}
          <span className={"text-pink-500"}>{formatTime(countdown)}</span>
        </p>
        <p className="">
          Didn&apos;t receive the code?{" "}
          <Button
            variant={"ghost"}
            className={
              "cursor-pointer p-0 text-primary-green underline hover:bg-transparent hover:text-primary-green/80"
            }
            disabled={isResending || isLoading}
            onClick={handleResend}
          >
            {isResending ? "Resending code..." : "Resend code"}
          </Button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
