import * as z from "zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { useAppSelector } from "@/lib/redux/hooks";
import { userApiSlice } from "@/lib/redux/services/user";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BusinessDocument, DocType } from "@/lib/types/user";
import { UploadField } from "@/components/auth/upload-field";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import HelpModal from "@/components/onboarding-checklist/business-profile/forms/help-modal";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = "application/pdf,image/jpeg,image/png";

const formSchema = z.object({
  businessLicense: z.string().min(1, "Business permit"),
  businessPlan: z.string().optional(),
  pitchDeck: z.string().min(1, "Pitch deck is required"),
});

interface RegulatoryDocsProps {
  onNext: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onPrevious: () => void;
}

const RegulatoryDocs = ({
  onNext,
  onLoadingChange,
  onPrevious,
}: RegulatoryDocsProps) => {
  const [existingDocuments, setExistingDocuments] = useState<
    BusinessDocument[]
  >([]);

  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [modalText] = useState("");

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
      businessLicense: "",
      businessPlan: "",
      pitchDeck: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!documentResponse?.documents?.length) return;

    const businessLicense = documentResponse.documents.find(
      (doc) => doc.docType === DocType.BusinessPermit,
    );
    const businessPlan = documentResponse.documents.find(
      (doc) => doc.docType === DocType.BusinessPlan,
    );
    const pitchDeck = documentResponse.documents.find(
      (doc) => doc.docType === DocType.PitchDeck,
    );

    const relevantDocs = documentResponse.documents.filter(
      (doc) =>
        doc.docType === DocType.BusinessPermit ||
        doc.docType === DocType.BusinessPlan ||
        doc.docType === DocType.PitchDeck,
    );

    setExistingDocuments(relevantDocs);

    if (
      businessLicense?.docPath ||
      businessPlan?.docPath ||
      pitchDeck?.docPath
    ) {
      form.reset(
        {
          businessLicense: businessLicense?.docPath || "",
          businessPlan: businessPlan?.docPath || "",
          pitchDeck: pitchDeck?.docPath || "",
        },
        {
          keepDefaultValues: false,
          keepDirty: false,
        },
      );
    }
  }, [documentResponse?.documents, form]);

  const handleDocumentUpload = async (path: string, docType: number) => {
    if (!personalGuid || !businessProfile?.business?.businessGuid) {
      toast({
        title: "Error",
        description: "Business profile not found",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadBusinessDoc({
        businessGuid: businessProfile.business.businessGuid,
        path,
        docType,
        BankCode: "",
        pin: "",
      }).unwrap();
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };

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

      const businessLicenseDoc = existingDocuments.find(
        (d) => d.docType === DocType.BusinessPermit,
      );
      const businessPlanDoc = existingDocuments.find(
        (d) => d.docType === DocType.BusinessPlan,
      );
      const pitchDeckDoc = existingDocuments.find(
        (d) => d.docType === DocType.PitchDeck,
      );

      if (
        values.businessLicense &&
        !businessLicenseDoc?.docPath.includes(values.businessLicense)
      ) {
        await handleDocumentUpload(
          values.businessLicense,
          DocType.BusinessPermit,
        );
      }

      if (
        values.businessPlan &&
        !businessPlanDoc?.docPath.includes(values.businessPlan)
      ) {
        await handleDocumentUpload(values.businessPlan, DocType.BusinessPlan);
      }

      if (
        values.pitchDeck &&
        !pitchDeckDoc?.docPath.includes(values.pitchDeck)
      ) {
        await handleDocumentUpload(values.pitchDeck, DocType.PitchDeck);
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
          <Skeleton className="h-[150px] w-full" />
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

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="mb-6 h-[50svh] pr-4">
            <div className="space-y-4">
              <div>
                <FormField
                  control={form.control}
                  name="businessLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Business permit</FormLabel>
                      <FormControl>
                        <UploadField
                          {...field}
                          type="identity"
                          accept={ACCEPTED_FILE_TYPES}
                          maxSize={MAX_FILE_SIZE}
                          label="Business Permit"
                          supportingText="Upload your business plan document (PDF, JPEG, PNG up to 10MB)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className={"text-sm font-medium mt-2"}>
                  Don&apos;t have a business license or permit?{" "}
                  <a
                    className={"text-primary-green hover:underline"}
                    href={
                      "mailto:support@melaninkapital.com?subject=" +
                      encodeURIComponent("Assistance with Business Permit")
                    }
                  >
                    Click here for assistance with applying
                  </a>
                </p>
              </div>
              <div>
                <h2 className="text-xl font-medium text-midnight-blue mt-10 mb-4">
                  Strategic Documents
                </h2>
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="businessPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Business Plan with financial projections
                      </FormLabel>
                      <FormControl>
                        <UploadField
                          {...field}
                          type="identity"
                          accept={
                            "application/pdf,image/jpeg,image/png,.xls,.xlsx"
                          }
                          maxSize={MAX_FILE_SIZE}
                          label="Business Plan"
                          supportingText="Upload your business permit (PDF, JPEG, XLS, XLSX) up to 10MB"
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription className={"text-sm text-midnight-blue"}>
                        A well-drafted business plan helps to assess your
                        business strategy and growth potential which is crucial
                        for determining your loan eligibility. Ensure that your
                        business plan includes detailed financial projections to
                        speed-up the approval process.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <p className={"text-sm font-medium mt-4"}>
                  Don&apos;t have a business plan?{" "}
                  <Link
                    href={
                      "https://nw.mercycorps.org/sites/default/files/2021-07/United-States-MCNW-Business_Plan_Template2016%20%282%29.pdf"
                    }
                    target={"_blank"}
                    className={
                      "text-primary-green cursor-pointer hover:underline"
                    }
                  >
                    Click here to get a template
                  </Link>
                </p>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="pitchDeck"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        Pitch Deck or Company Profile
                      </FormLabel>
                      <FormControl>
                        <UploadField
                          {...field}
                          type="identity"
                          accept={ACCEPTED_FILE_TYPES}
                          maxSize={MAX_FILE_SIZE}
                          label="Pitch Deck or Company Profile"
                          supportingText="Upload your pitch deck presentation or your company profile document (PDF, JPEG, PNG up to 10MB)"
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription className={"text-sm text-midnight-blue"}>
                        A comprehensive pitch deck offers valuable insights into
                        your business structure and operations, which are
                        essential for attracting investors are securing funding.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <p className={"text-sm font-medium mt-4"}>
                  Don&apos;t have a company pitch deck?{" "}
                  <Link
                    href={"https://slidebean.com/pitch-deck-template"}
                    target={"_blank"}
                    className={
                      "text-primary-green cursor-pointer hover:underline"
                    }
                  >
                    Click here to get a template
                  </Link>
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="py-4 space-y-2">
            <Button
              type="submit"
              size="lg"
              className={"w-full"}
              disabled={isUpdating || !form.formState.isValid}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete
            </Button>
            <Button
              type="button"
              className={
                "w-full flex justify-center items-center gap-2 underline underline-offset-4"
              }
              variant="ghost"
              size="lg"
              onClick={onPrevious}
            >
              <ArrowLeft />
              Back
            </Button>
          </div>
        </form>
      </Form>
      <HelpModal
        open={helpModalOpen}
        setOpen={setHelpModalOpen}
        currentStep={modalText}
      />
    </>
  );
};

export default RegulatoryDocs;
