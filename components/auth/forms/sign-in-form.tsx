"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";

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

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Please input a password"),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  const isValid = form.formState.isValid;

  async function onSubmit(values: SignInFormValues) {
    if (!isLoaded || !signIn) {
      toast.error("Authentication system is not ready");
      return;
    }

    try {
      setIsLoading(true);

      // Attempt to sign in with email and password
      const result = await signIn.create({
        identifier: values.email,
        password: values.password,
      });

      // Check if sign-in was successful
      if (result.status === "complete") {
        // Set the active session
        await setActive({ session: result.createdSessionId });
        
        // Redirect to dashboard
        router.push("/");
        toast.success("Signed in successfully");
      } else {
        // Handle additional verification steps if needed
        // This could be 2FA, email verification, etc.
        console.log("Additional verification needed:", result);
        
        // For now, we'll just show a generic message
        toast.info("Additional verification required");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      
      // Handle specific error cases
      let errorMessage = "Failed to sign in. Please check your credentials.";
      
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0];
        
        if (error.code === "form_identifier_not_found") {
          errorMessage = "No account found with this email address.";
        } else if (error.code === "form_password_incorrect") {
          errorMessage = "Incorrect password. Please try again.";
        } else {
          errorMessage = error.message || errorMessage;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="w-full rounded-lg bg-white p-4 sm:p-6 md:p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-green border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading authentication...</p>
      </div>
    );
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
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      id="rememberMe" 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <label 
                    htmlFor="rememberMe" 
                    className="text-sm sm:text-base text-[#151F28] cursor-pointer"
                  >
                    Remember me?
                  </label>
                </FormItem>
              )}
            />
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
