import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForgotPasswordMutation } from "@/lib/redux/services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    toast.promise(forgotPassword(data).unwrap(), {
      loading: "Sending reset instructions...",
      success: () => {
        router.push("/check-email");
        return "Reset instructions sent successfully";
      },
      error: (err) => {
        if (err.data?.message) {
          return err.data.message;
        }
        return "An error occurred";
      },
    });
  };

  return (
    <div
      className={
        "flex flex-col justify-center gap-2 p-9 text-center font-medium text-midnight-blue"
      }
    >
      <h1 className={"text-4xl font-bold leading-normal tracking-tight"}>
        Forgot your password?
      </h1>
      <p className={"text-2xl font-normal tracking-tight"}>
        Please enter your email address and we’ll send you a verification code
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={"mt-8 space-y-8"}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="janedoe@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className={"w-full"}
            size={"lg"}
            type="submit"
            disabled={!form.formState.isValid || isLoading}
          >
            Send Reset Instructions
          </Button>
        </form>
      </Form>
      <Link
        className={"font-medium text-primary-green underline"}
        href={"/sign-in"}
      >
        Back to Sign in
      </Link>
    </div>
  );
};

export default ForgotPassword;
