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
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/lib/redux/services/auth";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";

const FormSchema = z.object({
  code: z.string().min(1),
});

const CheckEmail = () => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const router = useRouter();
  const userId = useAppSelector(selectCurrentToken);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    toast.promise(
      resetPassword({
        code: data.code,
        guid: userId!,
      }),
      {
        loading: "Validating verification code...",
        success: () => {
          router.push("/new-password");
          return "Success";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResend = () => {
    setTimeLeft(300); // Reset timer to 5 minutes
    // Logic to resend the code goes here
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={"text-center px-4 md:px-0"}>
      <img
        src="https://s3-alpha-sig.figma.com/img/0bf2/e83e/57eeda06a97eb0366c3e11b5632cee91?Expires=1731283200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=lOtTvNCaWJbl9UBopjUy675dz5Cu21MqmeYVGVQ-Be-l8rDL1Ml6RMbyiGmn1WmlG5U2YC9mcL3PPz90c~OrMU~uSmgfh-~RXVNYJAla799lrBrPJAoSuxy3H1AXRXLUxG6rcLn0R4z7oHvmOV5HNrJg8ljp4~IXi37AA6ZGK~fVU~LPSIixTSU2FWaJF7XkOLeecpOP~GnT09byJxKVRFNQYJR~-RN2INTwHBj~qCG-hQeLxMkRFRl14nrM4RidK-tmL4Pr8ICuVIV2WKqPcpXjNcXveoIkNzOEvfKqTjwMSSidabfj-BCxr6N2EGApQZek~j7S~07dKUdUKOlngQ__"
        alt="Email Icon"
        className={"mx-auto mb-4 h-32 md:h-48 w-32 md:w-48"}
      />
      <h1 className={"text-2xl md:text-4xl font-bold leading-normal"}>Check your email</h1>
      <p className={"text-lg md:text-2xl font-normal"}>
        Please enter the verification code that was sent to your email{" "}
        <span className={"text-lg md:text-2xl font-medium text-primary-green"}>
          john***@gmail.com
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
            disabled={isLoading}
          >
            Continue
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
          disabled={isLoading}
          onClick={handleResend}
        >
          Resend Code
        </Button>
      </p>
    </div>
  );
};

export default CheckEmail;
