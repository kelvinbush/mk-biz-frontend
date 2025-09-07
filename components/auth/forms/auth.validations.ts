import { z } from "zod";

export const SignUpSchema = z
  .object({
    firstname: z.string().min(1, { message: "First name is required" }),
    lastname: z.string().min(1, { message: "Last name is required" }),
    email: z
      .string({
        required_error: "You must put in an email",
      })
      .email({
        message: "You must put in a valid email",
      }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    gender: z.string().min(1, { message: "Gender is required" }),
    dob: z.string().min(1, { message: "Date of birth is required" }),
    password: z
      .string({
        required_error: "You must put in a password",
      })
      .min(6, {
        message: "Your password must be 6 chars long or more",
      }),
    confirm_password: z.string(),
  })
  .refine(
    (values) => {
      return values.password === values.confirm_password;
    },
    {
      message: "Passwords must match!",
      path: ["confirm_password"],
    },
  );

export type TSignUp = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .min(1, { message: "Email is required" }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(1, { message: "Password is required" }),
});

export type TSignIn = z.infer<typeof SignInSchema>;
