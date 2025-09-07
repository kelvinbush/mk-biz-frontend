// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { z } from "zod";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  useGetUserQuery,
  useUpdateUserProfileMutation,
  useVerifyPhoneNumberMutation,
} from "@/lib/redux/services/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResendPhoneOtpMutation } from "@/lib/redux/services/auth";
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
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const FormSchema = z.object({
  code: z.string().min(1),
});

const PhoneFormSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
});

const COUNTDOWN_TIME = 600; // 10 minutes in seconds

const VerifyPhone = () => {
  const userId = useAppSelector(selectCurrentToken);
  const { data: userResponse } = useGetUserQuery({ guid: userId! });
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const phoneForm = useForm<z.infer<typeof PhoneFormSchema>>({
    resolver: zodResolver(PhoneFormSchema),
    defaultValues: {
      phoneNumber: userResponse?.personal.phoneNumber?.replace(/^\+/, "") ?? "",
    },
  });

  const { isValid } = useFormValidation(form);
  const router = useRouter();
  const [verifyPhoneMutation, { isLoading }] = useVerifyPhoneNumberMutation();
  const [resendOtp, { isLoading: isResending }] = useResendPhoneOtpMutation();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const handleSkip = () => {
    router.push("/set-business");
  };

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
      verifyPhoneMutation({
        code: data.code,
        guid: userId!,
      }).unwrap(),
      {
        loading: "Verifying phone number...",
        success: () => {
          router.push("/set-business");
          return "Phone number verified successfully";
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

  const handlePhoneUpdate = async (data: z.infer<typeof PhoneFormSchema>) => {
    if (userResponse?.personal.verifiedPhone === 1) {
      toast.error(
        "Phone number already verified. Please log in to update your phone number.",
      );
      setIsEditing(false);
      return;
    }

    try {
      toast.promise(
        updateProfile({
          guid: userId!,
          profile: {
            ...userResponse?.personal,
            dateOfBirth: userResponse?.personal.birthDate ?? "",
            phoneNumber: `${data.phoneNumber}`,
          },
        }).unwrap(),
        {
          loading: "Updating phone number...",
          success: () => {
            handleResend();
            return "Phone number updated successfully";
          },
          error: "Failed to update phone number",
        },
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating phone number:", error);
    }
  };

  return (
    <div className={"text-center px-4 md:px-0"}>
      <img
        src="/images/phone.gif"
        alt="Phone Icon"
        className={"mx-auto mb-4 h-32 md:h-48 w-32 md:w-48"}
      />
      <h1 className={"text-2xl md:text-4xl font-bold leading-normal"}>
        Verify your phone number
      </h1>
      <p className={"text-lg md:text-2xl font-normal"}>
        Please enter the verification code that was sent to your number{" "}
        <span
          className={
            "text-lg md:text-2xl font-medium text-primary-green inline-flex items-center gap-2"
          }
        >
          {userResponse?.personal?.phoneNumber}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Phone Number</DialogTitle>
              </DialogHeader>
              <Form {...phoneForm}>
                <form
                  onSubmit={phoneForm.handleSubmit(handlePhoneUpdate)}
                  className="space-y-4"
                >
                  <FormField
                    control={phoneForm.control}
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
                              // Remove the "0" after country code if present
                              const cleanedPhone = phone.replace(
                                /^(\d{3})0/,
                                "$1",
                              );
                              onChange(`+${cleanedPhone}`);
                            }}
                            inputClass="!w-full !h-10 !text-base"
                            buttonClass="!h-10"
                            containerClass="!w-full"
                            enableSearch
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="h-11 md:h-12 text-base" disabled={isUpdating}>
                    Update Phone Number
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
            type="submit"
            className="w-full h-11 md:h-12 text-base"
            size={"lg"}
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Verifying phone number..." : "Verify phone number"}
          </Button>
        </form>
      </Form>
      <div className={"text-left text-sm md:text-base"}>
        <p className="mt-2">
          Code expires in{" "}
          <span className={"text-pink-500"}>{formatTime(countdown)}</span>
        </p>
      </div>
      <div className="mt-2 rounded-lg border p-3 md:p-4 text-left">
        <p className="text-xs md:text-sm">
          <span className="font-medium">
            Having trouble receiving the verification code?
          </span>
          <br />
          You may have blocked promotional messages. Dial{" "}
          <span className="font-semibold">
            *456*9*5#
          </span>, select{" "}
          <span className="italic">Activate by Sender Name</span>, enter{" "}
          <span className="font-semibold">MELANIN</span>, or choose{" "}
          <span className="italic">Activate All Promo Messages</span>, then
          request a new code.
        </p>
      </div>
      <div className="mt-1 flex flex-col md:flex-row gap-2 items-center justify-center text-sm md:text-base">
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
        <span className="hidden md:inline">OR</span>
        <Button
          variant={"ghost"}
          className={
            "cursor-pointer p-0 text-primary-green underline hover:bg-transparent hover:text-primary-green/80"
          }
          onClick={handleSkip}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default VerifyPhone;
