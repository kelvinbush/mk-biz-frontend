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
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  code: z.string().min(1),
});

// Default to 10 minutes (600 seconds) - Clerk's default expiration time
const COUNTDOWN_TIME = 600;

const ClerkCheckEmail = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_TIME);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  
  const router = useRouter();

  // Get the current email from Clerk's signUp object
  useEffect(() => {
    if (isLoaded && signUp) {
      const pendingEmail = signUp.emailAddress;
      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    }
  }, [isLoaded, signUp]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
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
      router.push("/");
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
      setTimeLeft(COUNTDOWN_TIME);
      
      toast.success("Code sent successfully");
    } catch (err: any) {
      console.error("Error resending verification code:", err);
      toast.error(err?.errors?.[0]?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
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
      <h1 className={"text-2xl md:text-4xl font-bold leading-normal"}>Check your email</h1>
      <p className={"text-lg md:text-2xl font-normal"}>
        Please enter the verification code that was sent to your email{" "}
        <span className={"text-lg md:text-2xl font-medium text-primary-green"}>
          {email ? email : "your email"}
        </span>
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={"mt-6 md:mt-8 space-y-6 md:space-y-8 max-w-sm mx-auto"}
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
                <FormDescription className={"text-midnight-blue text-sm md:text-base"}>
                  Code expires in{" "}
                  <span className={"text-pink-500"}>
                    {formatTime(timeLeft)}
                  </span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className={"w-full h-11 md:h-12 text-base"}
            size={"lg"}
            type="submit"
            disabled={isLoading || isResending}
          >
            {isLoading ? "Verifying..." : "Continue"}
          </Button>
        </form>
      </Form>
      <p className="text-right mt-4 text-sm md:text-base">
        Didn&apos;t receive the code?{" "}
        <Button
          variant={"ghost"}
          className={
            "cursor-pointer p-0 text-primary-green underline hover:bg-transparent hover:text-primary-green/80"
          }
          disabled={isLoading || isResending}
          onClick={handleResend}
        >
          {isResending ? "Resending..." : "Resend Code"}
        </Button>
      </p>
    </div>
  );
};

export default ClerkCheckEmail;
