import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  userApiSlice,
  useUpdateBusinessProfileMutation,
} from "@/lib/redux/services/user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { InputWithCurrency } from "@/components/ui/input-with-currency";

const formSchema = z
  .object({
    monthlyTurnover: z.coerce.number({
      message: "Please enter your monthly turnover in USD",
    }),
    yearlyTurnover: z.coerce.number({
      message: "Please enter your yearly turnover in USD",
    }),
    hasBorrowingHistory: z.enum(["yes", "no"], {
      required_error: "Please select if you have borrowing history",
    }),
    amountBorrowed: z.coerce.number().optional(),
    defaultCurrency: z.string().min(1, "Currency is required").optional(),
    currency: z.string().min(1, "Currency is required").optional(),
    loanStatus: z
      .enum(["fully_repaid", "currently_being_repaid", "defaulted"])
      .optional(),
    defaultReason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasBorrowingHistory === "yes") {
        // Require loan status when there's borrowing history
        if (!data.loanStatus) {
          return false;
        }
        // Require amount borrowed when there's borrowing history
        if (!data.amountBorrowed) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Please fill in all required fields",
      path: ["loanStatus"],
    },
  );

// Utility function to format numbers with commas
const formatNumberWithCommas = (value: string | number): string => {
  if (!value && value !== 0) return "";

  // Convert to string and remove any existing non-numeric characters except decimal point
  const numericValue = value.toString().replace(/[^\d.]/g, "");

  // Split the number at the decimal point
  const parts = numericValue.split(".");

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Rejoin with decimal part if it exists
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
};

// Utility function to parse formatted number back to numeric value
const parseFormattedNumber = (formattedValue: string): number => {
  // Remove all non-numeric characters except decimal point
  const numericString = formattedValue.replace(/[^\d.]/g, "");
  return numericString ? parseFloat(numericString) : 0;
};

const FinancialDetails = ({
  onNext,
  onPrevious,
}: {
  onNext: () => void;
  onPrevious: () => void;
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [, setShowBorrowingFields] = useState(false);
  const [currencyValue, setCurrencyValue] = useState("USD");
  const [, setSelectKey] = useState(0); // Add a key to force re-render
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
  });

  const {
    watch,
    formState: { isValid: formIsValid },
  } = form;
  const showDefaultReason = watch("loanStatus") === "defaulted";
  const hasBorrowingHistory = watch("hasBorrowingHistory") === "yes";

  useEffect(() => {
    if (response?.business) {
      // Set the currency state directly from the API response
      const apiCurrency = response.business.currency || "USD";
      setCurrencyValue(apiCurrency);
      console.log("API Currency:", apiCurrency);

      form.reset({
        monthlyTurnover: response.business.averageMonthlyTurnover,
        yearlyTurnover: response.business.averageAnnualTurnover,
        hasBorrowingHistory: response.business.previousLoans ? "yes" : "no",
        amountBorrowed: response.business.loanAmount,
        defaultCurrency: response.business.defaultCurrency ?? "KES",
        currency: apiCurrency,
        loanStatus: response.business.previousLoans
          ? (response.business.recentLoanStatus?.toLowerCase() as
              | "fully_repaid"
              | "currently_being_repaid"
              | "defaulted")
          : undefined,
        defaultReason: response.business.defaultReason ?? "",
      });
      setShowBorrowingFields(response.business.previousLoans);
      // Ensure currency is set even if it's not in the response
      if (!response.business.currency) {
        form.setValue("currency", "USD");
      }
      // Force set the currency field value after form reset
      setTimeout(() => {
        form.setValue("currency", apiCurrency);
        setCurrencyValue(apiCurrency);
        setSelectKey((prev) => prev + 1); // Increment key to force re-render
        console.log("Forced currency value:", apiCurrency);
      }, 100);
    }
  }, [response, form]);

  console.log("FinancialDetails Form Currency:", form.getValues("currency"));
  console.log("FinancialDetails Currency State:", currencyValue);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!response?.business) return;

    try {
      // Always provide a recentLoanStatus, use "NONE" if not set
      const loanStatus =
        values.hasBorrowingHistory === "yes" && values.loanStatus
          ? values.loanStatus.toUpperCase()
          : "NONE";

      // Always provide a defaultReason, empty string if not set
      const defaultReason =
        values.hasBorrowingHistory === "yes" &&
        values.loanStatus === "defaulted" &&
        values.defaultReason
          ? values.defaultReason.trim()
          : "";

      await updateBusinessProfile({
        ...response.business,
        businessLogo: response.business.businessLogo || "",
        yearOfRegistration: response.business.yearOfRegistration ?? "",
        previousLoans: values.hasBorrowingHistory === "yes",
        loanAmount: values.amountBorrowed ?? 0,
        defaultCurrency: values.defaultCurrency ?? "KES",
        currency: values.currency ?? "USD",
        recentLoanStatus: loanStatus,
        averageAnnualTurnover: values.yearlyTurnover,
        averageMonthlyTurnover: values.monthlyTurnover,
        defaultReason,
        businessGuid: response.business.businessGuid,
      }).unwrap();

      toast.success("Financial details updated successfully");
      onNext();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update financial details");
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
        id={`multi-step-bus-2`}
      >
        <ScrollArea className="h-[40vh] sm:h-[50svh] px-4 sm:px-8">
          <div className={"overflow-y-auto"}>
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
              <FormField
                control={form.control}
                name="monthlyTurnover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">
                      Average Monthly Turnover{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <InputWithCurrency
                        type="text"
                        currencyValue={currencyValue}
                        onCurrencyValueChange={(value) => {
                          setCurrencyValue(value);
                          form.setValue("currency", value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        className="h-10 md:h-12 text-sm md:text-base"
                        value={formatNumberWithCommas(field.value)}
                        onChange={(e) => {
                          // Parse the formatted value back to a number for the form state
                          const numericValue = parseFormattedNumber(
                            e.target.value,
                          );
                          field.onChange(numericValue);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearlyTurnover"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">
                      Average Yearly Turnover{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <InputWithCurrency
                        type="text"
                        currencyValue={currencyValue}
                        onCurrencyValueChange={(value) => {
                          setCurrencyValue(value);
                          form.setValue("currency", value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        className="h-10 md:h-12 text-sm md:text-base"
                        value={formatNumberWithCommas(field.value)}
                        onChange={(e) => {
                          // Parse the formatted value back to a number for the form state
                          const numericValue = parseFormattedNumber(
                            e.target.value,
                          );
                          field.onChange(numericValue);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage className="text-xs md:text-sm" />
                  </FormItem>
                )}
              />

              {/* Hidden field to maintain currency in form state */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <input
                    type="hidden"
                    {...field}
                    value={currencyValue}
                    onChange={(e) => {
                      field.onChange(e);
                      // This ensures the onChange handler is called properly
                      // which is important for the form to track dirty state
                    }}
                  />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hasBorrowingHistory"
              render={({ field }) => (
                <FormItem className="space-y-2 md:space-y-3 mt-4 md:mt-6">
                  <FormLabel className="text-sm md:text-base">
                    Does the business have any previous borrowing history?{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "no") {
                          form.setValue("loanStatus", undefined, {
                            shouldValidate: true,
                          });
                          form.setValue("amountBorrowed", 0, {
                            shouldValidate: true,
                          });
                          form.setValue("defaultReason", "", {
                            shouldValidate: true,
                          });
                        }
                      }}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm md:text-base">
                          Yes
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm md:text-base">
                          No
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />

            {hasBorrowingHistory && (
              <>
                <FormField
                  control={form.control}
                  name="amountBorrowed"
                  render={({ field }) => (
                    <FormItem className="mt-4 md:mt-6">
                      <FormLabel className="text-sm md:text-base">
                        Amount borrowed <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <InputWithCurrency
                          type="text"
                          currencyValue={currencyValue}
                          onCurrencyValueChange={(value) => {
                            setCurrencyValue(value);
                            form.setValue("defaultCurrency", value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          className="h-10 md:h-12 text-sm md:text-base"
                          value={formatNumberWithCommas(field.value as number)}
                          onChange={(e) => {
                            // Parse the formatted value back to a number for the form state
                            const numericValue = parseFormattedNumber(
                              e.target.value,
                            );
                            field.onChange(numericValue);
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage className="text-xs md:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loanStatus"
                  render={({ field }) => (
                    <FormItem className="mt-4 md:mt-6">
                      <FormLabel className="text-sm md:text-base">
                        What is the status of your most recent loan?{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 md:h-12 text-sm md:text-base">
                            <SelectValue placeholder="Select loan status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fully_repaid">
                            Fully Repaid
                          </SelectItem>
                          <SelectItem value="currently_being_repaid">
                            Currently Being Repaid
                          </SelectItem>
                          <SelectItem value="defaulted">Defaulted</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs md:text-sm" />
                    </FormItem>
                  )}
                />

                {showDefaultReason && (
                  <FormField
                    control={form.control}
                    name="defaultReason"
                    render={({ field }) => (
                      <FormItem className={"relative mt-4 md:mt-6"}>
                        <FormLabel className="text-sm md:text-base">
                          Please share the reason for defaulting on your most
                          recent loan (Optional){" "}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="text-sm md:text-base min-h-[80px] md:min-h-[100px]"
                            onChange={(e) => {
                              const words = e.target.value
                                .split(/\s+/)
                                .filter(Boolean);
                              if (words.length <= 150) {
                                field.onChange(e);
                                setWordCount(words.length);
                              }
                            }}
                          />
                        </FormControl>
                        <div className="absolute bottom-2 md:bottom-6 right-2 text-xs md:text-sm text-gray-500">
                          {wordCount}/100
                        </div>
                        <FormDescription className="text-xs md:text-sm">
                          We understand that financial challenges can arise, and
                          we&apos;re here to help you find the right financial
                          solution.
                        </FormDescription>
                        <FormMessage className="text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-4 pt-4 px-4 sm:px-8">
          <Button
            type="submit"
            disabled={!formIsValid || isUpdating}
            size="lg"
            className="w-full"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
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

export default FinancialDetails;
