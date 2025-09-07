"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import "react-phone-input-2/lib/style.css";

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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@/lib/redux/services/auth";
import { setUserId } from "@/lib/redux/features/authSlice";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import {useRouter} from "next/navigation";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Please input a password"),
});

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter()

  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const { isValid } = useFormValidation(form);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await login(values).unwrap();
      dispatch(
        setUserId({
          userGuid: result.guid,
          userEmail: values.email,
          userPhone: "",
        }),
      );
      router.push("/");
      toast.success("Signed in successfully");
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      toast.error(error?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="w-full rounded-lg bg-white p-4 sm:p-6 md:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-midnight-blue">
          Sign in to your account
        </h2>
        <p className="mt-2 text-base sm:text-lg md:text-xl text-midnight-blue">
          Welcome! Please provide the following to continue
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} className="h-11" />
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
                <FormLabel required>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm sm:text-base text-[#151F28]">
                Remember me?
              </label>
            </div>
            <Link
              href={"/forgot-password"}
              className="text-sm sm:text-base font-medium text-[#00B67C] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            size="lg"
            type="submit"
            className="w-full h-12 mt-6"
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm sm:text-base text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href={"/sign-up"}
          className="font-medium text-[#00B67C] underline"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
