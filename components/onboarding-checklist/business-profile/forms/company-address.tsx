import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  userApiSlice,
  useUpdateBusinessProfileMutation,
} from "@/lib/redux/services/user";
import React, { useEffect } from "react";
import { locationOptions } from "@/lib/types/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  streetAddress: z.string().min(1, "Street address is required"),
  additionalDetails: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
});

const CompanyAddress = ({
  onNext,
  onPrevious,
}: {
  onNext: () => void;
  onPrevious: () => void;
}) => {
  const guid = useAppSelector(selectCurrentToken);
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

  useEffect(() => {
    if (response?.business) {
      const business = response.business;
      form.reset({
        streetAddress: business.street1,
        additionalDetails: business.street2 || "",
        country: business.country.toLowerCase(),
        city: business.city,
        zipCode: business.postalCode,
      });
    }
  }, [response, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!response?.business) return;

    try {
      await updateBusinessProfile({
        businessName: response.business.businessName,
        businessDescription: response.business.businessDescription,
        typeOfIncorporation: response.business.typeOfIncorporation,
        sector: response.business.sector,
        location: response.business.location,
        city: values.city,
        country: values.country,
        street1: values.streetAddress,
        street2: values?.additionalDetails ?? "",
        postalCode: values.zipCode,
        averageAnnualTurnover: response.business.averageAnnualTurnover,
        averageMonthlyTurnover: response.business.averageMonthlyTurnover,
        previousLoans: response.business.previousLoans,
        loanAmount: response.business.loanAmount,
        recentLoanStatus: response.business.recentLoanStatus,
        defaultReason: response.business.defaultReason,
        businessGuid: response.business.businessGuid,
        businessLogo: response.business.businessLogo || "",
        yearOfRegistration: response.business.yearOfRegistration ?? "",
        isBeneficalOwner: false,
        defaultCurrency: response.business.defaultCurrency,
        currency: response.business.currency,
      }).unwrap();
      onNext();
    } catch (error) {
      console.error("Failed to update business profile:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[30vh] sm:h-[50vh]">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="pb-4"
        id={`multi-step-bus-1`}
      >
        <ScrollArea className="h-[40vh] sm:h-[50svh] px-4 sm:px-8">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Street address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="additionalDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional address details (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apartment, building, floor etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Zip code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter zip code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-4 pt-4 px-4 sm:px-8">
          <Button
            type="submit"
            disabled={isUpdating || !form.formState.isValid}
            size={"lg"}
            className="w-full"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={"lg"}
            className="w-full flex justify-center items-center gap-2 text-sm sm:text-base text-primary-green underline underline-offset-4"
            onClick={onPrevious}
            disabled={isUpdating}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyAddress;
