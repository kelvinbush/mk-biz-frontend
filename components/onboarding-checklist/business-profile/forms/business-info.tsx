"use client";

import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  userApiSlice,
  useUpdateBusinessProfileMutation,
} from "@/lib/redux/services/user";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  incorporationTypeOptions,
  sampleSectors,
  years,
} from "@/lib/types/types";
import { AddBusinessSchemaNoOwnership } from "@/components/auth/forms/add-business.validation";
import { useFormValidation } from "@/lib/hooks/useFormValidation";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function BusinessRegistrationForm({
  onNext,
}: {
  onNext: () => void;
}) {
  const guid = useAppSelector(selectCurrentToken);
  const [wordCount, setWordCount] = useState(0);
  const { data: response, isLoading } =
    userApiSlice.useGetBusinessProfileByPersonalGuidQuery(
      { guid: guid || "" },
      { skip: !guid },
    );
  const [updateBusinessProfile, { isLoading: isUpdating }] =
    useUpdateBusinessProfileMutation();

  const form = useForm<z.infer<typeof AddBusinessSchemaNoOwnership>>({
    resolver: zodResolver(AddBusinessSchemaNoOwnership),
    defaultValues: {
      name: "",
      description: "",
      legal: "",
      year: "",
      sector: "",
    },
  });

  const { isValid } = useFormValidation(form);

  useEffect(() => {
    if (response?.business) {
      const business = response.business;
      form.reset({
        name: business.businessName,
        description: business.businessDescription,
        legal: business.typeOfIncorporation,
        year: business.yearOfRegistration,
        sector: business.sector,
      });
    }
  }, [response, form]);

  async function onSubmit(
    values: z.infer<typeof AddBusinessSchemaNoOwnership>,
  ) {
    if (!response?.business) return;

    try {
      await updateBusinessProfile({
        businessName: values.name,
        businessDescription: values.description,
        typeOfIncorporation: values.legal,
        sector: values.sector,
        location: response.business.location,
        city: response.business.city,
        country: response.business.country,
        street1: response.business.street1,
        street2: response.business.street2,
        postalCode: response.business.postalCode,
        averageAnnualTurnover: response.business.averageAnnualTurnover,
        averageMonthlyTurnover: response.business.averageMonthlyTurnover,
        previousLoans: response.business.previousLoans,
        loanAmount: response.business.loanAmount,
        recentLoanStatus: response.business.recentLoanStatus,
        defaultReason: response.business.defaultReason,
        businessGuid: response.business.businessGuid,
        businessLogo: response.business.businessLogo || "",
        yearOfRegistration: values.year,
        isBeneficalOwner: false,
        defaultCurrency: response.business.defaultCurrency,
        currency: response.business.currency,
      }).unwrap();

      onNext();
    } catch (error) {
      console.error("Error updating business profile:", error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[30vh] sm:h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!response?.business) {
    return (
      <div className="flex h-[30vh] sm:h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load business profile</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="pb-4">
        <ScrollArea className="h-[40vh] sm:h-[50svh] px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-1 sm:col-span-2">
                  <FormLabel required>Business name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"description"}
              render={({ field }) => (
                <FormItem className="col-span-1 sm:col-span-2 relative">
                  <FormLabel required>Business description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={"Briefly explain what your business does..."}
                      {...field}
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
                  <div className="absolute bottom-2 right-2 text-xs sm:text-sm text-gray-500">
                    {wordCount}/150
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SearchableSelect
              name="legal"
              label="Business legal entity type"
              notFound="No legal entity type was found"
              options={incorporationTypeOptions}
              placeholder="Select business type"
              required={true}
              control={form.control}
              className="col-span-1"
            />
            <SearchableSelect
              name="year"
              label="Year of business registration"
              notFound="No year was found"
              options={years}
              placeholder="Select year of incorporation"
              required={true}
              control={form.control}
              className="col-span-1"
            />
            <SearchableSelect
              name="sector"
              label="Sector"
              notFound="No sector was found"
              options={sampleSectors}
              placeholder="Select business sector"
              required={true}
              control={form.control}
              className="col-span-1 sm:col-span-2"
            />
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-4 pt-4 px-4 sm:px-8">
          <Button
            type="submit"
            disabled={isUpdating || !isValid}
            size={"lg"}
            className="w-full"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
          <Link
            href="/onboarding-checklist"
            className="flex justify-center items-center gap-2 text-sm sm:text-base text-primary-green underline underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Checklist
          </Link>
        </div>
      </form>
    </Form>
  );
}
