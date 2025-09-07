import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import "react-phone-input-2/lib/style.css";
import { format } from "date-fns";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useUpdateUserProfileMutation } from "@/lib/redux/services/user";
import { UserResponse } from "@/lib/types/user";
import { Loader2 } from "lucide-react";
import { TProfileForm } from "@/components/my-profile/components/personal-information";

interface ProfileFormProps {
  form: UseFormReturn<TProfileForm>;
  user: UserResponse;
}

const ProfileForm = ({ form, user }: ProfileFormProps) => {
  const userId = useAppSelector(selectCurrentToken);
  const [updateProfile, { isLoading }] = useUpdateUserProfileMutation();

  function onSubmit(values: TProfileForm) {
    toast.promise(
      updateProfile({
        profile: {
          ...user.personal,
          ...values,
          birthDate: new Date(values.birthDate).toISOString(),
        },
        guid: userId!,
      }).unwrap(),
      {
        loading: "Updating profile...",
        success: () => {
          return "Profile updated successfully";
        },
        error: (err) => {
          if (err.data?.message) {
            return err.data.message;
          }
          return "An error occurred";
        },
      },
    );
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 md:space-y-6"
        >
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">
                    First name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">
                    Last name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="h-10 md:h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">
                    Phone number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="h-10 md:h-11"
                      placeholder="Enter phone number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required className="text-sm md:text-base">
                    Gender
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 md:h-11">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required className="text-sm md:text-base">
                    Date of birth
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="h-10 md:h-11"
                      max={format(new Date(), "yyyy-MM-dd")}
                      min="1900-01-01"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        // Trigger validation immediately
                        form.trigger("birthDate");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxIdNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required className="text-sm md:text-base">
                    Tax identification number
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identityDocNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required className="text-sm md:text-base">
                    ID number
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="positionHeld"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">
                    Position held
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              size={"lg"}
              type="submit"
              disabled={
                isLoading || 
                !form.formState.isDirty || 
                Object.keys(form.formState.errors).length > 0
              }
              className="w-full md:w-auto px-4 md:px-8 py-2 md:py-2.5 text-sm md:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileForm;
