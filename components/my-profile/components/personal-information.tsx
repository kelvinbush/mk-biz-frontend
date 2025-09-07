// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetUserQuery } from "@/lib/redux/services/user";
import ProfileForm from "../profile-form";
import { withAuth } from "@/components/auth/RequireAuth";

// Profile Form Schema
const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(6, "Phone number must be at least 6 digits"),
  gender: z.enum(["female", "male", "other"]),
  birthDate: z
    .string()
    .min(1, "Date of birth is required")
    // Must be a valid date
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }, "Invalid date of birth")
    // Cannot be in the future
    .refine((date) => {
      const d = new Date(date);
      const today = new Date();
      d.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return d <= today;
    }, "Birth date cannot be in the future")
    // Not an outrageous past date
    .refine((date) => {
      const d = new Date(date);
      const min = new Date(1900, 0, 1); // Jan 1, 1900
      return d >= min;
    }, "Please enter a realistic date of birth")
    // Age bounds: 18 to 120
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age >= 18 && age <= 120;
    }, "You must be between 18 and 120 years old"),
  positionHeld: z.string().optional(),
  identityDocNumber: z.string(),
  taxIdNumber: z.string(),
});

export type TProfileForm = z.infer<typeof profileFormSchema>;

const PersonalInformation = () => {
  const userId = useAppSelector(selectCurrentToken);
  const {
    data: user,
    error: userError,
    isLoading: userIsLoading,
  } = useGetUserQuery({ guid: userId! });

  const profileForm = useForm<TProfileForm>({
    resolver: zodResolver(profileFormSchema),
  });

  useEffect(() => {
    if (user?.personal) {
      const { personal } = user;
      const formData = {
        firstName: personal.firstName || "",
        lastName: personal.lastName || "",
        email: personal.email || "",
        phoneNumber: personal.phoneNumber || "",
        gender: personal.gender || "other",
        birthDate: personal.birthDate?.split("T")[0] || "",
        positionHeld: personal.positionHeld || "",
        identityDocNumber: personal.identityDocNumber || "",
        taxIdNumber: personal.taxIdNumber || "",
      };

      // Use setTimeout to ensure the form is properly initialized
      setTimeout(() => {
        profileForm.reset(formData);
      }, 0);
    }
  }, [profileForm, user]);

  if (userError) {
    return <div>Error loading user data</div>;
  }

  if (userIsLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <ProfileForm form={profileForm} user={user} />
    </div>
  );
};

export default withAuth(PersonalInformation);
