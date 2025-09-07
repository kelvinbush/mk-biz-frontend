"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import Link from "next/link";

const formSchema = z.object({
  certificateOfIncorporation: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Certificate of incorporation is required",
    }),
  memorandumOfAssociation: z.instanceof(File).refine((file) => file.size > 0, {
    message: "Memorandum of association is required",
  }),
  articlesOfAssociation: z.instanceof(File).refine((file) => file.size > 0, {
    message: "Articles of association is required",
  }),
  otherDocuments: z.instanceof(File).optional(),
});

export default function CompaniesProofOfRegistration() {
  const [, setFiles] = useState({
    certificateOfIncorporation: null,
    memorandumOfAssociation: null,
    articlesOfAssociation: null,
    otherDocuments: null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificateOfIncorporation: undefined,
      memorandumOfAssociation: undefined,
      articlesOfAssociation: undefined,
      otherDocuments: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }));
      form.setValue(
        field as
          | "certificateOfIncorporation"
          | "memorandumOfAssociation"
          | "articlesOfAssociation"
          | "otherDocuments",
        file,
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-midnight-blue">
            Proof of registration
          </h3>
          <FormField
            control={form.control}
            name="certificateOfIncorporation"
            render={() => (
              <FormItem>
                <FormLabel className="text-midnight-blue" required>
                  Certificate of incorporation
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(e, "certificateOfIncorporation")
                    }
                    className="file:mr-4 file:rounded-full file:border-0 file:bg-primary-green file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-green/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memorandumOfAssociation"
            render={() => (
              <FormItem>
                <FormLabel className="text-midnight-blue" required>
                  Memorandum of association
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(e, "memorandumOfAssociation")
                    }
                    className="file:mr-4 file:rounded-full file:border-0 file:bg-primary-green file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-green/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="articlesOfAssociation"
            render={() => (
              <FormItem>
                <FormLabel className="text-midnight-blue" required>
                  Articles of association
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(e, "articlesOfAssociation")
                    }
                    className="file:mr-4 file:rounded-full file:border-0 file:bg-primary-green file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-green/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="otherDocuments"
            render={() => (
              <FormItem>
                <FormLabel className="text-midnight-blue">
                  Any other documents (optional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => handleFileChange(e, "otherDocuments")}
                    className="file:mr-4 file:rounded-full file:border-0 file:bg-primary-green file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-green/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormDescription>
            Not a registered business?{" "}
            <Link href="#" className="text-primary-green hover:underline">
              Click here for assistance with registration
            </Link>
          </FormDescription>
        </div>
      </form>
    </Form>
  );
}
