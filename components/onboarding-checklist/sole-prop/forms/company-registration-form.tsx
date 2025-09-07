import * as z from "zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { BusinessDocument, DocType } from "@/lib/types/user";
import { UploadField } from "@/components/auth/upload-field";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { userApiSlice } from "@/lib/redux/services/user";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = "application/pdf,image/jpeg,image/png";

const formSchema = z.object({
  certificateOfIncorporation: z
    .string()
    .min(1, "Certificate of incorporation is required"),
  memorandumOfAssociation: z.string().optional(),
  taxRegistration: z
    .string()
    .min(1, "Tax registration certificate is required"),
  taxClearance: z.string().min(1, "Tax clearance document is required"),
});

type CompanyRegistrationFormProps = {
  onNext: () => void;
  businessGuid: string;
  existingDocuments?: BusinessDocument[];
  onLoadingChange?: (isLoading: boolean) => void;
  onHelpClick: (text: string) => void;
};

export function CompanyRegistrationForm({
  onNext,
  businessGuid,
  existingDocuments = [],
  onLoadingChange,
  onHelpClick,
}: CompanyRegistrationFormProps) {
  const [uploadBusinessDoc, { isLoading: isUpdating }] =
    userApiSlice.useUploadBusinessDocumentMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificateOfIncorporation: "",
      memorandumOfAssociation: "",
      taxRegistration: "",
      taxClearance: "",
    },
  });

  useEffect(() => {
    if (!existingDocuments?.length) return;

    const certOfInc = existingDocuments.find(
      (doc) => doc.docType === DocType.BusinessRegistration,
    );
    const memOfAssoc = existingDocuments.find(
      (doc) => doc.docType === DocType.MemorandumOfAssociation,
    );
    const taxReg = existingDocuments.find(
      (doc) => doc.docType === DocType.TaxRegistrationDocument,
    );
    const taxClearance = existingDocuments.find(
      (doc) => doc.docType === DocType.TaxClearanceDocument,
    );

    form.reset(
      {
        certificateOfIncorporation: certOfInc?.docPath || "",
        memorandumOfAssociation: memOfAssoc?.docPath || "",
        taxRegistration: taxReg?.docPath || "",
        taxClearance: taxClearance?.docPath || "",
      },
      {
        keepDefaultValues: false,
        keepDirty: false,
      },
    );
  }, [existingDocuments, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      onLoadingChange?.(true);
      const loadingToast = toast({
        title: "Uploading",
        description: "Please wait while we upload your documents...",
        variant: "default",
      });

      const uploadPromises = [];

      // Helper function to upload document if changed
      const uploadIfChanged = async (
        docType: DocType,
        value?: string,
        existingDoc?: BusinessDocument,
      ) => {
        if (
          value &&
          (!existingDoc?.docPath || !existingDoc.docPath.includes(value))
        ) {
          return uploadBusinessDoc({
            businessGuid,
            path: value,
            docType,
            BankCode: "",
            pin: "",
          }).unwrap();
        }
      };

      const certOfInc = existingDocuments.find(
        (d) => d.docType === DocType.BusinessRegistration,
      );
      const memOfAssoc = existingDocuments.find(
        (d) => d.docType === DocType.MemorandumOfAssociation,
      );
      const taxReg = existingDocuments.find(
        (d) => d.docType === DocType.TaxRegistrationDocument,
      );
      const taxClearance = existingDocuments.find(
        (d) => d.docType === DocType.TaxClearanceDocument,
      );

      uploadPromises.push(
        uploadIfChanged(
          DocType.BusinessRegistration,
          values.certificateOfIncorporation,
          certOfInc,
        ),
        uploadIfChanged(
          DocType.MemorandumOfAssociation,
          values.memorandumOfAssociation,
          memOfAssoc,
        ),
        uploadIfChanged(
          DocType.TaxRegistrationDocument,
          values.taxRegistration,
          taxReg,
        ),
        uploadIfChanged(
          DocType.TaxClearanceDocument,
          values.taxClearance,
          taxClearance,
        ),
      );

      // Execute all uploads
      await Promise.all(uploadPromises.filter(Boolean));

      loadingToast.dismiss();
      toast({
        title: "Success",
        description: "All documents uploaded successfully",
        variant: "default",
      });

      onNext();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      onLoadingChange?.(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="certificateOfIncorporation"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Certificate of Incorporation</FormLabel>
              <FormControl>
                <UploadField
                  {...field}
                  type="identity"
                  accept={ACCEPTED_FILE_TYPES}
                  maxSize={MAX_FILE_SIZE}
                  label="Certificate of Incorporation"
                  supportingText="Upload your certificate of incorporation (PDF, JPEG, PNG up to 10MB)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memorandumOfAssociation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memorandum of Association</FormLabel>
              <FormControl>
                <UploadField
                  {...field}
                  type="identity"
                  accept={ACCEPTED_FILE_TYPES}
                  maxSize={MAX_FILE_SIZE}
                  label="Memorandum of Association"
                  supportingText="Upload Your Memorandum of Association (PDF, JPEG, PNG up to 10MB)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h2 className="text-xl font-medium text-midnight-blue mt-10 mb-4">
            Tax Compliance Documents
          </h2>
        </div>

        <FormField
          control={form.control}
          name="taxRegistration"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>
                Company tax registration certificate
              </FormLabel>
              <FormControl>
                <UploadField
                  {...field}
                  type="identity"
                  accept={ACCEPTED_FILE_TYPES}
                  maxSize={MAX_FILE_SIZE}
                  label="Tax Registration"
                  supportingText="Upload your tax registration certificate (PDF, JPEG, PNG up to 10MB)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-sm font-medium mt-2">
          Don&apos;t have a tax registration certificate?{" "}
          <span
            className="text-primary-green cursor-pointer hover:underline"
            onClick={() => onHelpClick("Tax Compliance Documents")}
          >
            Click here to get assistance with applying
          </span>
        </p>

        <FormField
          control={form.control}
          name="taxClearance"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Company tax clearance certificate</FormLabel>
              <FormControl>
                <UploadField
                  {...field}
                  type="identity"
                  accept={ACCEPTED_FILE_TYPES}
                  maxSize={MAX_FILE_SIZE}
                  label="Tax Clearance"
                  supportingText="Upload your tax clearance certificate (PDF, JPEG, PNG up to 10MB)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-sm font-medium mt-2">
          Don&apos;t have a tax clearance certificate?{" "}
          <span
            className="text-primary-green cursor-pointer hover:underline"
            onClick={() => onHelpClick("Tax Clearance Documents")}
          >
            Click here to get assistance with applying
          </span>
        </p>

        <div className="py-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isUpdating || !form.formState.isValid}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
