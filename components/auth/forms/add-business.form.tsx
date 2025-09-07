import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  AddBusinessSchema,
  TAddBusiness,
} from "@/components/auth/forms/add-business.validation";
import { useRouter } from "next/navigation";
import { useAddBusinessMutation } from "@/lib/redux/services/user";
import { toast } from "sonner";
import {
  incorporationTypeOptions,
  locationOptions,
  ownershipTypeOptions,
  sampleSectors,
  years,
} from "@/lib/types/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Icons } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DescriptiveSelect } from "@/components/ui/descriptive-select";

type AddBusinessFormProps = React.HTMLAttributes<HTMLDivElement>;

const AddBusinessForm = ({ className, ...props }: AddBusinessFormProps) => {
  const userId = useAppSelector(selectCurrentToken);
  const form = useForm<TAddBusiness>({
    resolver: zodResolver(AddBusinessSchema),
    defaultValues: {
      name: "",
      description: "",
      legal: "",
      year: "",
      location: "",
      sector: "",
      isBeneficialOwner: undefined as never,
      specificPosition: "",
    },
  });

  const router = useRouter();

  const [addBusiness, { isLoading }] = useAddBusinessMutation();

  const onSubmit = (data: TAddBusiness) => {
    toast.promise(
      addBusiness({
        business: data,
        guid: userId!,
      }),
      {
        loading: "Setting up your business...",
        success: () => {
          router.push("/verify-identity");
          return "Your business was added successfully";
        },
        error: (err) => {
          if (err.data?.message) {
            return err.data.message;
          }
          return "An error occurred";
        },
      },
    );
  };

  const [wordCount, setWordCount] = useState(0);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-3xl md:max-w-4xl px-4 md:px-2",
        className,
      )}
      {...props}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8"
        >
          <FormField
            control={form.control}
            name={"name"}
            render={({ field }) => (
              <FormItem className={"col-span-1 md:col-span-2"}>
                <FormLabel className="text-sm md:text-base" required>
                  Business name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={"Enter business name"}
                    {...field}
                    className="h-11 md:h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"description"}
            render={({ field }) => (
              <FormItem className={"col-span-1 md:col-span-2 relative"}>
                <FormLabel className="text-sm md:text-base" required>
                  Business description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={"Briefly explain what your business does..."}
                    {...field}
                    className="min-h-[100px] text-base"
                    onChange={(e) => {
                      const words = e.target.value.split(/\s+/).filter(Boolean);
                      if (words.length <= 150) {
                        field.onChange(e);
                        setWordCount(words.length);
                      }
                    }}
                  />
                </FormControl>
                <div className="absolute bottom-2 right-2 text-xs md:text-sm text-gray-500">
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
            className="h-11 md:h-12 text-base"
            labelClassName="text-sm md:text-base"
          />
          <SearchableSelect
            name="year"
            label="Year of business registration"
            notFound="No year was found"
            options={years}
            placeholder="Select year of incorporation"
            required={true}
            control={form.control}
            className="h-11 md:h-12 text-base"
            labelClassName="text-sm md:text-base"
          />
          <SearchableSelect
            name="location"
            label="Business location/headquarters"
            notFound="No location was found"
            options={locationOptions}
            placeholder="Select location"
            required={true}
            control={form.control}
            className="h-11 md:h-12 text-base"
            labelClassName="text-sm md:text-base"
          />
          <SearchableSelect
            name="sector"
            label="Sector"
            notFound="No sector was found"
            options={sampleSectors}
            placeholder="Select business sector"
            required={true}
            control={form.control}
            className="h-11 md:h-12 text-base"
            labelClassName="text-sm md:text-base"
          />
          <div className={"col-span-1 md:col-span-2"}>
            <FormField
              control={form.control}
              name="isBeneficialOwner"
              render={({ field }) => (
                <FormItem className="space-y-4 md:space-y-5">
                  <FormLabel className="text-sm md:text-base" required>
                    Are you are a beneficial owner of the company?
                  </FormLabel>
                  <Card
                    className={
                      "flex gap-4 md:gap-6 p-3 md:p-4 shadow-md rounded-lg"
                    }
                  >
                    <Icons.needHelp
                      className={"h-6 w-6 md:h-8 md:w-8 flex-shrink-0"}
                    />
                    <p className={"text-xs md:text-sm font-normal"}>
                      A beneficial owner is a legal person who owns more than
                      25% of the capital or voting rights of a company, or has
                      control over its management.
                    </p>
                  </Card>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        // Reset the ownership fields when changing selection
                        if (value === "false") {
                          form.setValue(
                            "beneficialOwnerShareholding",
                            undefined,
                          );
                          form.setValue("beneficialOwnerType", undefined);
                        }
                        field.onChange(value === "true");
                      }}
                      value={field.value?.toString()}
                      className="flex flex-col gap-3 md:gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm md:text-base">
                          Yes, I am
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm md:text-base">
                          No, Im not
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Conditionally render ownership fields */}
          {String(form.watch("isBeneficialOwner")) === "true" && (
            <>
              <FormField
                control={form.control}
                name={"beneficialOwnerShareholding"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base" required>
                      Ownership Shareholding (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter shareholding percentage"
                        {...field}
                        className="h-11 md:h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DescriptiveSelect
                name="beneficialOwnerType"
                label="Ownership Type"
                notFound="No ownership type found"
                options={ownershipTypeOptions}
                placeholder="Select ownership type"
                required={true}
                control={form.control}
                labelClassName="text-sm md:text-base"
              />
            </>
          )}
          <Button
            type={"submit"}
            className={
              "col-span-1 md:col-span-2 py-4 md:py-6 h-11 md:h-12 text-base"
            }
            disabled={
              isLoading ||
              !form.formState.isDirty ||
              wordCount > 150 ||
              form.watch("isBeneficialOwner") === undefined
            }
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddBusinessForm;
