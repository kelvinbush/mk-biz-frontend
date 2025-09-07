"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {useEffect} from "react";

const formSchema = z.object({
  inquiryType: z.enum(["onboarding", "technical", "general"], {
    required_error: "Please select the nature of your inquiry",
  }),
  description: z
    .string()
    .min(1, "Please provide a description")
    .max(500, "Description cannot exceed 500 characters"),
  currentStep: z.string().min(1, "Current step is required"),
});

export default function HelpModal({
  open,
  setOpen,
  currentStep,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentStep: string;
}) {
  const [charCount, setCharCount] = React.useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inquiryType: "onboarding",
      description: "",
      currentStep: currentStep,
    },
  });

  useEffect(() => {
    form.setValue("currentStep", currentStep);
  }, [currentStep, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-7xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-4xl font-medium">
                We&apos;re here to help!
              </DialogTitle>
              <p className="mt-1 text-2xl text-[#444C53]">
                Submit your query, and we&apos;ll get back to you shortly
              </p>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <FormField
              control={form.control}
              name="inquiryType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    What is the nature of your inquiry?{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col gap-4 sm:flex-row"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="onboarding" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Difficulty completing onboarding step
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="technical" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Technical issue
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="general" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          General inquiry
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description of your issue{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Please provide a brief description of the problem you're facing"
                        className="min-h-[100px] resize-none pr-12"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setCharCount(e.target.value.length);
                        }}
                        maxLength={500}
                      />
                      <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {charCount}/100
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentStep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Current step <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-muted" readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 border-t border-border py-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setOpen(false)}
                className="py-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="bg-primary-green hover:bg-emerald-600 py-6"
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
