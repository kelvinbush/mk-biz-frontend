"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, Eye, EyeOff } from "lucide-react";

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
import { useNewPasswordMutation } from "@/lib/redux/services/auth";
import { toast } from "sonner";
import { useFormValidation } from "@/lib/hooks/useFormValidation";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must have at least 1 uppercase letter")
  .regex(/[a-z]/, "Must have at least 1 lowercase letter")
  .regex(/[0-9]/, "Must have at least 1 number")
  .regex(/[^A-Za-z0-9]/, "Must have at least 1 special character");

const formSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export default function PasswordResetForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword] = useNewPasswordMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { isValid } = useFormValidation(form);

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.promise(newPassword({ ...values, personalGuid: "" }).unwrap(), {
      loading: "Resetting password...",
      success: () => {
        return "Password reset successfully";
      },
      error: (err) => {
        if (err.data?.message) {
          return err.data.message;
        }
        return "An error occurred";
      },
    });
  }

  const watchPassword = form.watch("password");
  const watchConfirmPassword = form.watch("confirmPassword");

  const requirements = [
    { label: "8 Char", test: (val: string) => val.length >= 8 },
    {
      label: "1 Uppercase",
      test: (val: string) => /[A-Z]/.test(val),
    },
    { label: "1 Lowercase", test: (val: string) => /[a-z]/.test(val) },
    {
      label: "1 Digit",
      test: (val: string) => /[0-9]/.test(val),
    },
    { label: "1 Special", test: (val: string) => /[^A-Za-z0-9]/.test(val) },
    { 
      label: "Match", 
      test: (val: string) => val && watchConfirmPassword && val === watchConfirmPassword 
    },
  ];

  return (
    <div className="text-center px-4 md:px-0">
      <h1 className="mb-2 text-2xl md:text-4xl font-bold">Create new password</h1>
      <p className="mb-4 md:mb-6 text-lg md:text-2xl">
        Your password must be different from your previously used passwords
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6 max-w-md mx-auto">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm md:text-base" required>New password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="h-11 md:h-12 text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
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
          <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {requirements.map((req, index) => (
              <div
                key={index}
                className={`flex flex-col items-center justify-center rounded-md border p-1 md:p-2 text-center text-xs md:text-sm shadow-lg ${req.test(watchPassword) ? "border-green-500 text-green-500" : "border-gray-300 text-gray-500"}`}
              >
                {req.test(watchPassword) && <Check className="mb-1 h-3 md:h-4 w-3 md:w-4" />}
                {req.label}
                <p className="text-[8px] md:text-[10px]">
                  {index === 0
                    ? "Must be at least 8 characters long"
                    : index === 4
                      ? "Must have at least 1 special character from !@#$%^&*"
                    : index === 5
                      ? "Passwords must match"
                      : `Must have at least 1 ${req.label.toLowerCase()}`}
                </p>
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full h-11 md:h-12 text-base mt-4" disabled={!isValid}>
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  );
}
