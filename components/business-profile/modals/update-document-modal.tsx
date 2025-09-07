"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { BusinessDocument, DocType } from "@/lib/types/user";
import { useEdgeStore } from "@/lib/edgestore";
import { userApiSlice } from "@/lib/redux/services/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface UpdateDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDocument: BusinessDocument | null;
  documentTypeNames: Record<DocType, string>;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  validateFile: (file: File) => string | null;
  ALLOWED_FILE_TYPES: Record<string, string>;
  BANKS: { name: string; code: string }[];
  businessGuid: string;
  onUpdateSuccess: () => void;
  businessType: string;
}

// Define form schema with Zod
const formSchema = z.object({
  bankCode: z.string().optional(),
  pin: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdateDocumentModal({
  isOpen,
  onOpenChange,
  selectedDocument,
  documentTypeNames,
  isUploading,
  setIsUploading,
  validateFile,
  ALLOWED_FILE_TYPES,
  BANKS,
  businessGuid,
  onUpdateSuccess,
  businessType,
}: UpdateDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { edgestore } = useEdgeStore();
  const [uploadBusinessDocument] =
    userApiSlice.useUploadBusinessDocumentMutation();

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankCode: selectedDocument?.docBankCode || "",
      pin: selectedDocument?.docPin || "",
    },
  });

  // Update form values when selected document changes
  useEffect(() => {
    if (selectedDocument?.docType === DocType.AnnualBankStatement) {
      form.reset({
        bankCode: selectedDocument.docBankCode || "",
        pin: selectedDocument.docPin || "",
      });
    }
  }, [selectedDocument]);

  const handleFileUpdate = async (file: File) => {
    if (!selectedDocument) {
      toast({
        title: "Error",
        description: "No document selected for update",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      const res = await edgestore.publicFiles.upload({
        file,
      });

      const formValues = form.getValues();

      const bankData = getUpdateBankDetails(
        selectedDocument,
        formValues.bankCode || "",
        formValues.pin || "",
      );

      await uploadBusinessDocument({
        path: res.url,
        docType: selectedDocument.docType,
        businessGuid,
        ...bankData,
      }).unwrap();

      toast({
        title: "Success",
        description: "Document updated successfully",
      });

      onUpdateSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className={"text-3xl"}>
            Update{" "}
            {selectedDocument !== null
              ? (() => {
                  const docName = documentTypeNames[selectedDocument.docType];
                  const corporationTypes = [
                    "private-limited-company",
                    "public-limited-company", 
                    "limited-liability-company-llc",
                    "s-corporation",
                    "c-corporation"
                  ];
                  
                  if (docName === "Business Registration" && corporationTypes.includes(businessType)) {
                    return "Certificate of Incorporation";
                  }
                  
                  return docName;
                })()
              : "Document"}
          </DialogTitle>
          <DialogDescription className={"text-lg"}>
            Upload your document in PDF, PNG, or JPG format. Maximum file size
            is 10MB.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4">
            {selectedDocument?.docType === DocType.AnnualBankStatement && (
              <div className="space-y-4 mb-4">
                <FormField
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Bank</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-gray-200 p-4 text-sm">
                            <SelectValue placeholder="Select a bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {BANKS.map((bank) => (
                              <SelectItem key={bank.code} value={bank.code}>
                                {bank.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Bank Statement PIN (Optional)</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={"text"}
                            placeholder="Enter your bank statement PIN"
                            {...field}
                            className="w-full rounded-lg border border-gray-200 p-4 text-sm"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors hover:bg-gray-50",
                isUploading && "pointer-events-none opacity-50",
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-blue-50 p-3">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  ) : (
                    <Cloud className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium">
                    {isUploading
                      ? "Uploading..."
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, PNG or JPG (max. 10MB)
                  </p>
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={async (e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  const validationError = validateFile(selectedFile);
                  if (validationError) {
                    toast({
                      title: "Error",
                      description: validationError,
                      variant: "destructive",
                    });
                  } else {
                    await handleFileUpdate(selectedFile);
                  }
                }
              }}
              accept={Object.keys(ALLOWED_FILE_TYPES).join(",")}
              disabled={isUploading}
            />
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline" disabled={isUploading}>
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function getUpdateBankDetails(
  selectedDocument: BusinessDocument | null,
  bankCode: string,
  pin: string,
) {
  return selectedDocument?.docType === DocType.AnnualBankStatement
    ? {
        BankCode: bankCode,
        Pin: pin,
      }
    : {
        BankCode: "",
        Pin: "",
      };
}
