import { z } from "zod";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetUserQuery,
  useUpdateUserProfileMutation,
  useVerifyEmailMutation,
} from "@/lib/redux/services/user";
import { useResendEmailOtpMutation } from "@/lib/redux/services/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
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

const COUNTDOWN_TIME = 600; // 10 minutes in seconds

const VerifyEmail = () => {
  const userId = useAppSelector(selectCurrentToken);
  const [isEditing, setIsEditing] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const token = useAppSelector(selectCurrentToken);
  const { data: userResponse } = useGetUserQuery(
    { guid: token! },
    { skip: !token },
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const emailForm = useForm<z.infer<typeof EmailFormSchema>>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: {
      email: userResponse?.personal.email ?? "",
    },
  });

  const router = useRouter();

  const { isValid } = useFormValidation(form);

  const [verifyMailMutation, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useResendEmailOtpMutation();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

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

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    toast.promise(
      verifyMailMutation({ code: data.code, guid: userId! }).unwrap(),
      {
        loading: "Verifying email...",
        success: () => {
          router.push("/verify-phone");
          return "Email verified successfully";
        },
        error: (err) => {
          if (err.data?.message) {
            return err.data.message;
          }
          return "An error occurred";
        },
      },
    );
  };

  const handleResend = () => {
    toast.promise(resendOtp({ guid: userId! }).unwrap(), {
      loading: "Resending code...",
      success: () => {
        setCountdown(COUNTDOWN_TIME);
        setIsCountdownActive(true);
        return "Code sent successfully";
      },
      error: (err) => {
        if (err.data?.message) {
          return err.data.message;
        }
        return "An error occurred";
      },
    });
  };

  const handleEmailUpdate = async (data: z.infer<typeof EmailFormSchema>) => {
    if (userResponse?.personal.verifiedEmail === 1) {
      toast.error(
        "Email already verified. Please log in to update your email.",
      );
      setIsEditing(false);
      return;
    }

    toast.promise(
      updateProfile({
        guid: userId!,
        profile: {
          ...userResponse?.personal, // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          dateOfBirth: userResponse?.personal.birthDate ?? "",
          email: data.email,
        },
      }).unwrap(),
      {
        loading: "Updating email...",
        success: () => {
          setIsEditing(false);
          handleResend();
          return "Email updated successfully";
        },
        error: "Failed to update email",
      },
    );
  };

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
          {userResponse?.personal.email ?? ""}
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
            disabled={isResending || isLoading || !isValid}
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
