"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  userApiSlice,
  useUpdateBusinessProfileMutation,
} from "@/lib/redux/services/user";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { locationOptions } from "@/lib/types/types";

const formSchema = z.object({
  streetAddress: z.string().min(1, "Street address is required"),
  additionalDetails: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
});

type IProps = React.HTMLAttributes<HTMLDivElement>;

const CompanyAddress = ({ className, ...props }: IProps) => {
  const guid = useAppSelector(selectCurrentToken);
  const [isDirty, setIsDirty] = useState(false);
  const { data: response, isLoading } =
    userApiSlice.useGetBusinessProfileByPersonalGuidQuery(
      { guid: guid || "" },
      { skip: !guid },
    );
  const [updateBusinessProfile, { isLoading: isUpdating }] =
    useUpdateBusinessProfileMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      streetAddress: "",
      additionalDetails: "",
      country: "",
      city: "",
      zipCode: "",
    },
  });

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setIsDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (response?.business) {
      const business = response.business;
      form.reset({
        streetAddress: business.street1 || "",
        additionalDetails: business.street2 || "",
        country: business.country || "",
        city: business.city || "",
        zipCode: business.postalCode || "",
      });
      setIsDirty(false);
    }
  }, [response, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!response?.business) return;

    try {
      await updateBusinessProfile({
        businessName: response.business.businessName,
        businessDescription: response.business.businessDescription,
        typeOfIncorporation: response.business.typeOfIncorporation,
        sector: response.business.sector,
        location: response.business.location,
        city: data.city,
        country: data.country,
        street1: data.streetAddress,
        street2: data.additionalDetails || "",
        postalCode: data.zipCode,
        averageAnnualTurnover: response.business.averageAnnualTurnover,
        averageMonthlyTurnover: response.business.averageMonthlyTurnover,
        previousLoans: response.business.previousLoans,
        loanAmount: response.business.loanAmount,
        recentLoanStatus: response.business.recentLoanStatus,
        defaultReason: response.business.defaultReason,
        businessGuid: response.business.businessGuid,
        businessLogo: response.business.businessLogo || "",
        yearOfRegistration: response.business.yearOfRegistration,
        isBeneficalOwner: false,
        defaultCurrency: response.business.defaultCurrency,
        currency: response.business.currency,
      }).unwrap();

      toast.success("Company address updated successfully");
      setIsDirty(false);
    } catch (error) {
      console.error("Error updating company address:", error);
      toast.error("Failed to update company address. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 md:space-y-6", className)} {...props}>
      <div className="mb-4 md:mb-8 flex items-center gap-4 md:gap-8">
        <h2 className="shrink-0 text-xl md:text-2xl font-medium">Company Address</h2>
        <div className="h-[1px] md:h-[1.5px] w-full bg-gray-400" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel required className="text-sm md:text-base">Street address</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-12 text-sm md:text-base" />
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base">Additional details</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-12 text-sm md:text-base" />
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />

            <SearchableSelect
              name="country"
              label="Country"
              notFound="No country was found"
              options={locationOptions}
              placeholder="Select country"
              required={true}
              control={form.control}
              className="text-sm md:text-base"
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required className="text-sm md:text-base">City</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-12 text-sm md:text-base" />
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required className="text-sm md:text-base">Zip code</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-10 md:h-12 text-sm md:text-base" />
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end col-span-2">
            <Button
              type="submit"
              size="lg"
              disabled={isUpdating || !form.formState.isValid || !isDirty}
              className="bg-midnight-blue hover:bg-midnight-blue/90 h-10 md:h-12 text-sm md:text-base w-full md:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CompanyAddress;
