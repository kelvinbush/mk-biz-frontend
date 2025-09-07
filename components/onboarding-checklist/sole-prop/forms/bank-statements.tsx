// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as z from "zod";
import React, { useEffect, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { useAppSelector } from "@/lib/redux/hooks";
import { userApiSlice } from "@/lib/redux/services/user";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BusinessDocument, DocType } from "@/lib/types/user";
import { UploadField } from "@/components/auth/upload-field";
import { Skeleton } from "@/components/ui/skeleton";
// Using native select for bank picker
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = "application/pdf,image/jpeg,image/png";

// Bank list data structure
const BANKS = [
  { name: "ABSA Bank", code: "ABSA" },
  { name: "Bank of Africa", code: "BOA" },
  {
    name: "CARITAS",
    code: "CARITAS",
  },
  { name: "Centenary Bank", code: "CENTENARY" },
  {
    name: "Consolidated Bank",
    code: "CONSOBK",
  },
  { name: "Co-operative Bank", code: "COOP" },
  { name: "Credit Bank", code: "CREDIT" },
  {
    name: "DTB Bank",
    code: "DTB",
  },
  { name: "Equity Bank", code: "Equity" },
  { name: "Family Bank", code: "FAMILY" },
  {
    name: "Faulu MFB",
    code: "FAULU",
  },
  { name: "Fortune Bank", code: "FORTUNE" },
  { name: "GT Bank", code: "GT" },
  {
    name: "Gulf",
    code: "Gulf",
  },
  { name: "Habib Bank", code: "HABIB" },
  { name: "HF Bank", code: "HF" },
  {
    name: "HFC Bank",
    code: "HFC",
  },
  { name: "I&M Bank", code: "INM" },
  { name: "Kenya Commercial Bank", code: "KCB" },
  {
    name: "Kenya Women MFB",
    code: "KWFT",
  },
  { name: "Kingdom Bank", code: "KINGDOM" },
  { name: "NATIONAL Bank", code: "NBK" },
  {
    name: "NCBA Bank",
    code: "NCBA",
  },
  { name: "NCBA Loop", code: "NCBALoop" },
  { name: "NIC Bank", code: "NIC" },
  {
    name: "Post Bank",
    code: "POSTBANK",
  },
  { name: "Prime Bank", code: "PRIME" },
  { name: "Rafiki MFB", code: "RAFIKI" },
  {
    name: "SBM Bank",
    code: "SBM",
  },
  { name: "SIDIAN Bank", code: "SIDIAN" },
  { name: "SMEP", code: "SMEP" },
  {
    name: "Stanbic Bank",
    code: "STANBIC",
  },
  { name: "Standard Chartered Bank", code: "SCB" },
  { name: "TNSACCO", code: "TNSACCO" },
  {
    name: "UBA Bank",
    code: "UBA",
  },
  { name: "U&I MFB", code: "UNI" },
  { name: "WINAS", code: "WINAS" },
  { name: "Other", code: "OTHER" },
];

const formSchema = z
  .object({
    hasActiveAccount: z.enum(["yes", "no"], {
      required_error:
        "Please select whether you have an active business bank account",
    }),
    bankName: z.string().optional(),
    bankStatementPin: z.string().optional(),
    financialStatementsPin: z.string().optional(),
    financialStatements2Pin: z.string().optional(),
    financialStatements3Pin: z.string().optional(),
    incomeStatementsPin: z.string().optional(),
    bankStatement: z.string(),
    financialStatements: z.string().optional(), // Made optional
    incomeStatements: z.string().optional(),
    financialStatements2: z.string().optional(),
    financialStatements3: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasActiveAccount === "yes") {
        // Bank name is required when user has an active account
        if (!data.bankName || data.bankName.length === 0) {
          return false;
        }

        const hasAtLeastOneFinancialStatement =
          data.financialStatements?.length > 0 ||
          data.financialStatements2?.length > 0 ||
          data.financialStatements3?.length > 0;

        const hasBankStatement = data.bankStatement.length > 0;

        // Must have EITHER a bank statement OR at least one financial statement
        return hasBankStatement || hasAtLeastOneFinancialStatement;
      }
      return true;
    },
    {
      message:
        "Please provide bank name and either a bank statement or at least one financial statement (any year)",
      path: ["bankStatement"],
    },
  );

interface BankStatementsProps {
  onNext: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onPrevious: () => void;
}

const BankStatements = ({
  onNext,
  onLoadingChange,
  onPrevious,
}: BankStatementsProps) => {
  const [existingDocuments, setExistingDocuments] = useState<
    BusinessDocument[]
  >([]);
  const personalGuid = useAppSelector(selectCurrentToken);
  const [uploadBusinessDoc, { isLoading: isUpdating }] =
    userApiSlice.useUploadBusinessDocumentMutation();

  const { data: businessProfile, isLoading: isLoadingProfile } =
    userApiSlice.useGetBusinessProfileByPersonalGuidQuery(
      { guid: personalGuid || "" },
      { skip: !personalGuid },
    );

  const { data: documentResponse, isLoading: isLoadingDocuments } =
    userApiSlice.useGetBusinessDocumentsQuery(
      {
        businessGuid: businessProfile?.business?.businessGuid || "",
      },
      { skip: !businessProfile?.business?.businessGuid },
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasActiveAccount: "yes",
      bankName: "",
      bankStatementPin: "",
      financialStatementsPin: "",
      financialStatements2Pin: "",
      financialStatements3Pin: "",
      incomeStatementsPin: "",
      bankStatement: "",
      financialStatements: "",
    },
    mode: "",
  });

  useEffect(() => {
    if (!documentResponse?.documents?.length) return;

    const bankStatement = documentResponse.documents.find(
      (doc) => doc.docType === DocType.AnnualBankStatement,
    );
    const financialStatement = documentResponse.documents.find(
      (doc) => doc.docType === DocType.AuditedFinancialStatement,
    );
    const incomeStatement = documentResponse.documents.find(
      (doc) => doc.docType === DocType.BalanceCahsFlowIncomeStatement,
    );
    const financialStatement2 = documentResponse.documents.find(
      (doc) => doc.docType === DocType.AuditedFinancialStatementyear2,
    );
    const financialStatement3 = documentResponse.documents.find(
      (doc) => doc.docType === DocType.AuditedFinancialStatementyear3,
    );

    const relevantDocs = documentResponse.documents.filter(
      (doc) =>
        doc.docType === DocType.AnnualBankStatement ||
        doc.docType === DocType.AuditedFinancialStatement ||
        doc.docType === DocType.BalanceCahsFlowIncomeStatement ||
        doc.docType === DocType.AuditedFinancialStatementyear2 ||
        doc.docType === DocType.AuditedFinancialStatementyear3,
    );

    setExistingDocuments(relevantDocs);

    const bankNameFromDocs = bankStatement?.docBankCode || "";
    const bankStatementPinFromDocs = bankStatement?.docPin || "";

    if (
      bankStatement?.docPath ||
      financialStatement?.docPath ||
      financialStatement2?.docPath ||
      financialStatement3?.docPath ||
      bankStatement?.docBankCode
    ) {
      form.reset(
        {
          hasActiveAccount: "yes",
          bankName: bankNameFromDocs,
          bankStatementPin: bankStatementPinFromDocs,
          bankStatement: bankStatement?.docPath || "",
          financialStatements: financialStatement?.docPath || "",
          incomeStatements: incomeStatement?.docPath || "",
          financialStatements2: financialStatement2?.docPath || "",
          financialStatements3: financialStatement3?.docPath || "",
        },
        {
          keepDefaultValues: false,
          keepDirty: false,
        },
      );
    }
  }, [documentResponse?.documents, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoadingProfile) {
      toast({
        title: "Loading",
        description: "Please wait while we load your business profile",
        variant: "default",
      });
      return;
    }

    if (!businessProfile?.business?.businessGuid) {
      toast({
        title: "Error",
        description:
          "Business profile not found. Please complete your business registration first.",
        variant: "destructive",
      });
      return;
    }

    try {
      onLoadingChange?.(true);
      const loadingToast = toast({
        title: "Uploading",
        description: "Please wait while we upload your documents...",
        variant: "default",
      });

      const bankStatementDoc = existingDocuments.find(
        (d) => d.docType === DocType.AnnualBankStatement,
      );
      const financialStatementDoc = existingDocuments.find(
        (d) => d.docType === DocType.AuditedFinancialStatement,
      );

      const incomeStatementDoc = existingDocuments.find(
        (d) => d.docType === DocType.BalanceCahsFlowIncomeStatement,
      );

      // Get the selected bank code from the bank name - only for bank statement
      const selectedBank = BANKS.find(
        (bank) =>
          bank.name === values.bankName || bank.code === values.bankName,
      );
      const bankCode = selectedBank?.code || "";

      if (
        values.bankStatement &&
        !bankStatementDoc?.docPath.includes(values.bankStatement)
      ) {
        await uploadBusinessDoc({
          businessGuid: businessProfile.business.businessGuid,
          path: values.bankStatement,
          docType: DocType.AnnualBankStatement,
          BankCode: bankCode, // Only apply bank code to bank statement
          pin: values.bankStatementPin || "",
        }).unwrap();
      }

      if (
        values.financialStatements &&
        !financialStatementDoc?.docPath.includes(values.financialStatements)
      ) {
        await uploadBusinessDoc({
          businessGuid: businessProfile.business.businessGuid,
          path: values.financialStatements,
          docType: DocType.AuditedFinancialStatement,
          pin: values.financialStatementsPin || "", // Only pass PIN, no bank code
          BankCode: "",
        }).unwrap();
      }

      if (
        values.financialStatements2 &&
        !financialStatementDoc?.docPath.includes(values.financialStatements2)
      ) {
        await uploadBusinessDoc({
          businessGuid: businessProfile.business.businessGuid,
          path: values.financialStatements2,
          docType: DocType.AuditedFinancialStatementyear2,
          pin: values.financialStatements2Pin || "", // Only pass PIN, no bank code
          BankCode: "",
        }).unwrap();
      }

      if (
        values.financialStatements3 &&
        !financialStatementDoc?.docPath.includes(values.financialStatements3)
      ) {
        await uploadBusinessDoc({
          businessGuid: businessProfile.business.businessGuid,
          path: values.financialStatements3,
          docType: DocType.AuditedFinancialStatementyear3,
          pin: values.financialStatements3Pin || "", // Only pass PIN, no bank code
          BankCode: "",
        }).unwrap();
      }

      if (
        values.incomeStatements &&
        !incomeStatementDoc?.docPath.includes(values.incomeStatements)
      ) {
        await uploadBusinessDoc({
          businessGuid: businessProfile.business.businessGuid,
          path: values.incomeStatements,
          docType: DocType.BalanceCahsFlowIncomeStatement,
          pin: values.incomeStatementsPin || "", // Only pass PIN, no bank code
          BankCode: "",
        }).unwrap();
      }

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

  if (isLoadingProfile || isLoadingDocuments) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-[150px] w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    );
  }

  const hasActiveAccount = form.watch("hasActiveAccount");

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="hasActiveAccount"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel required>
                  Do you have an active business bank account?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes, I do</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        No, I don&apos;t
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {hasActiveAccount === "yes" && (
            <>
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Select your bank</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-lg border border-gray-200 p-3 text-sm bg-white"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <option value="" disabled>
                          Select a bank
                        </option>
                        {BANKS.map((bank) => (
                          <option key={bank.code} value={bank.code}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankStatementPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Statement PIN (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type={"text"}
                        placeholder="Enter your bank statement PIN"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="bankStatement"
            render={({ field }) => (
              <FormItem>
                <FormLabel required={hasActiveAccount === "yes"}>
                  {hasActiveAccount === "yes"
                    ? "Upload your Bank Account Statement"
                    : "Upload your personal bank or Mpesa statement for the last 12 months"}
                </FormLabel>
                <FormControl>
                  <UploadField
                    {...field}
                    maxSize={MAX_FILE_SIZE}
                    accept={ACCEPTED_FILE_TYPES}
                    onUpload={(path) => {
                      field.onChange(path);
                    }}
                    label={"Bank Statement"}
                    supportingText={
                      "Upload your bank statement for the last 12 months (PDF, JPEG, PNG up to 10MB)"
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <h2 className="text-xl font-medium text-midnight-blue">
            Financial Statements
          </h2>
          {hasActiveAccount === "yes" && (
            <>
              <FormField
                control={form.control}
                name="financialStatements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Upload your management accounts for the year 2024
                      {!form.getValues("bankStatement") && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <UploadField
                        {...field}
                        maxSize={MAX_FILE_SIZE}
                        accept={ACCEPTED_FILE_TYPES}
                        onUpload={(path) => {
                          field.onChange(path);
                        }}
                        label="Management Accounts"
                        supportingText={
                          "Upload your management accounts for the year 2024 (PDF, JPEG, PNG up to 10MB)"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialStatements2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Upload your audited financial statement for the year 2023
                      {!form.getValues("bankStatement") && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <UploadField
                        {...field}
                        maxSize={MAX_FILE_SIZE}
                        accept={ACCEPTED_FILE_TYPES}
                        onUpload={(path) => {
                          field.onChange(path);
                        }}
                        label="Audited Financial Statement for the year 2023"
                        supportingText={
                          "Upload your audited financial statement for the year 2023 (PDF, JPEG, PNG up to 10MB)"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="financialStatements3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Upload your audited financial statement for the year 2022
                      {!form.getValues("bankStatement") && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <UploadField
                        {...field}
                        maxSize={MAX_FILE_SIZE}
                        accept={ACCEPTED_FILE_TYPES}
                        onUpload={(path) => {
                          field.onChange(path);
                        }}
                        label={"Audited Financial Statement for the year 2022"}
                        supportingText={
                          "Upload your audited financial statement for the year 2022 (PDF, JPEG, PNG up to 10MB)"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="incomeStatements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Upload your recent income statements, balance sheets or cash
                  flow statements (Optional)
                </FormLabel>
                <FormControl>
                  <UploadField
                    {...field}
                    maxSize={MAX_FILE_SIZE}
                    accept={ACCEPTED_FILE_TYPES}
                    onUpload={(path) => {
                      field.onChange(path);
                    }}
                    supportingText={
                      "Upload your recent income statements (PDF, JPEG, PNG up to 10MB)"
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="py-4 space-y-2">
            <Button
              type="submit"
              size="lg"
              className={"w-full"}
              disabled={isUpdating || !form.formState.isValid}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onPrevious}
              className={
                "w-full flex justify-center items-center gap-2 underline underline-offset-4"
              }
            >
              <ArrowLeft />
              Back
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BankStatements;
