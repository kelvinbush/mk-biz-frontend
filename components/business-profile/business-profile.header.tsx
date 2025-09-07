"use client";

import React, { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Camera, ExternalLink, Share2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import {
  userApiSlice,
  useUpdateBusinessProfileMutation,
} from "@/lib/redux/services/user";
import { cn } from "@/lib/utils";
import { useEdgeStore } from "@/lib/edgestore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadField } from "@/components/auth/upload-field";

// Constants for file validation
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

// Required document types for business profile completion
const REQUIRED_DOC_TYPES = [0, 2, 4, 5, 6, 7]; // Business Registration, Permit, Bank Statement, Budget, Plan, Pitch Deck

// Required profile fields for completion calculation
const REQUIRED_PROFILE_FIELDS = [
  "businessName",
  "businessDescription",
  "typeOfIncorporation",
  "sector",
  "location",
  "city",
  "country",
  "street1",
  "postalCode",
  "averageAnnualTurnover",
  "averageMonthlyTurnover",
] as const;

const validateFile = (file: File): string | null => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `Invalid file type. Allowed types are: PDF, PPT, PPTX`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
  }

  return null;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

interface BusinessProfileHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  location: string;
  companyType: string;
  isVerified: boolean;
  imageUrl: string;
  pitchDeckUrl: string;
  onImageUpload?: () => void;
  onShare?: () => void;
}

const BusinessProfileHeader = ({
  name,
  location,
  companyType,
  imageUrl,
  onImageUpload,
  onShare,
  className,
  ...props
}: BusinessProfileHeaderProps) => {
  const [, setCompletionPercentage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guid = useAppSelector(selectCurrentToken);
  const { edgestore } = useEdgeStore();
  const [uploadBusinessDocument] =
    userApiSlice.useUploadBusinessDocumentMutation();
  const [logoUrl, setLogoUrl] = useState(imageUrl);

  const handleCameraClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLogoModalOpen(true);
  };

  // Fetch business profile
  const { data: response } =
    userApiSlice.useGetBusinessProfileByPersonalGuidQuery(
      { guid: guid || "" },
      { skip: !guid },
    );

  // Fetch business documents
  const { data: documentResponse } = userApiSlice.useGetBusinessDocumentsQuery(
    { businessGuid: response?.business?.businessGuid || "" },
    { skip: !response?.business?.businessGuid },
  );

  const [updateBusinessProfile] = useUpdateBusinessProfileMutation();

  const handleLogoUpload = async (url: string) => {
    if (!response?.business) return;
    toast.promise(
      updateBusinessProfile({
        businessName: response.business.businessName,
        businessDescription: response.business.businessDescription,
        typeOfIncorporation: response.business.typeOfIncorporation,
        sector: response.business.sector,
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
        businessLogo: url,
        yearOfRegistration: response.business.yearOfRegistration ?? "",
        isBeneficalOwner: false,
        defaultCurrency: response.business.defaultCurrency,
        currency: response.business.currency,
      }).unwrap(),
      {
        loading: "Updating logo...",
        success: () => {
          setLogoUrl(url);
          setIsLogoModalOpen(false);
          return "Logo updated successfully";
        },
        error: "Failed to update logo",
      },
    );
  };

  // Calculate completion percentage
  useEffect(() => {
    if (response?.business) {
      // Calculate profile fields completion (50% of total)
      const filledFields = REQUIRED_PROFILE_FIELDS.filter(
        (field) =>
          response.business[field] != null && response.business[field] !== "",
      ).length;
      const profilePercentage =
        (filledFields / REQUIRED_PROFILE_FIELDS.length) * 50;

      // Calculate documents completion (50% of total)
      let documentPercentage = 0;
      if (documentResponse?.documents) {
        const uploadedDocTypes = new Set(
          documentResponse.documents.map(
            (doc: { docType: number }) => doc.docType,
          ),
        );
        const uploadedRequiredDocs = REQUIRED_DOC_TYPES.filter((docType) =>
          uploadedDocTypes.has(docType),
        ).length;
        documentPercentage =
          (uploadedRequiredDocs / REQUIRED_DOC_TYPES.length) * 50;
      }

      setCompletionPercentage(
        Math.round(profilePercentage + documentPercentage),
      );
    }
  }, [response?.business, documentResponse?.documents]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload to EdgeStore
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress);
        },
      });

      // Upload to backend
      await uploadBusinessDocument({
        businessGuid: response?.business?.businessGuid || "",
        docType: -1, // PitchDeck
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        docPath: res.url,
      }).unwrap();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setUploadProgress(0);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const pitchDeck = documentResponse?.documents?.find(
    (doc: { docType: number }) => doc.docType === 7,
  );

  // Memoize the background style to prevent unnecessary re-renders
  const backgroundStyle = React.useMemo(
    () => ({
      backgroundImage: "url(/images/abstract.png)",
      backgroundPosition: "center",
      backgroundSize: "cover",
    }),
    [],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-gradient-to-r from-gray-900/90 to-gray-900/70",
        className,
      )}
      {...props}
      style={backgroundStyle}
    >
      <div
        className="absolute inset-0 "
        style={{
          backgroundColor: "rgba(21, 31, 40, 0.5)",
        }}
      />
      <div className="p-4 md:p-6">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
          <div className="relative shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={
                      logoUrl === ""
                        ? "https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png"
                        : logoUrl
                    }
                    alt={`${name} Logo`}
                    className="h-20 w-20 md:h-28 md:w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Company Logo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {onImageUpload && (
              <button
                onClick={handleCameraClick}
                className="absolute bottom-0 right-0 grid h-6 w-6 md:h-8 md:w-8 cursor-pointer place-items-center rounded-full border-2 border-white bg-primary-green transition-colors hover:bg-primary-green/90"
              >
                <Camera className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </button>
            )}
          </div>
          <div className="w-full space-y-1 relative text-center md:text-left">
            <h1 className="text-xl md:text-3xl font-medium text-white">
              {name}
              {/*<Badge
                variant="secondary"
                className={cn(
                  "ml-2 inline-flex h-5 md:h-6 gap-1 md:gap-1.5 rounded-lg border-none font-medium shadow-lg md:absolute md:right-3 text-xs md:text-sm",
                  isVerified
                    ? "bg-primary-green/20 text-primary-green"
                    : "bg-zinc-500/20 text-zinc-300",
                )}
              >
                {isVerified ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {isVerified ? "Verified" : "Pending verification"}
              </Badge>*/}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white text-sm md:text-base">
              <span className="capitalize">
                {companyType.replace(/-/g, " ")}
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white text-sm md:text-base">
              <span>{location}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 pt-2 flex-wrap">
              {pitchDeck ? (
                <a
                  href={pitchDeck.docPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Button
                    variant="link"
                    className="h-7 md:h-8 gap-1 md:gap-1.5 p-0 text-xs md:text-sm text-primary-green underline transition-colors hover:text-primary-green/90"
                  >
                    Company pitch deck
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              ) : null}
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="h-7 md:h-8 gap-1 md:gap-1.5 bg-transparent text-white transition-colors hover:bg-white/10 text-xs md:text-sm"
                >
                  <Share2 className="h-3 w-3" />
                  Share Profile
                </Button>
              )}
            </div>

            {/*<div className="space-y-1.5 pt-2">*/}
            {/*  <div className="flex items-center justify-end text-sm font-medium text-white">*/}
            {/*    <p>*/}
            {/*      <span className="font-medium text-white">*/}
            {/*        {Math.round(completionPercentage)}%*/}
            {/*      </span>{" "}*/}
            {/*      Complete*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*  <Progress*/}
            {/*    value={Math.round(completionPercentage)}*/}
            {/*    className="h-2 bg-white/20"*/}
            {/*    indicatorClassName="bg-primary-green"*/}
            {/*  />*/}
            {/*</div>*/}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Upload Company Logo
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Upload your company logo. Supported formats: PNG, JPG, JPEG or
              PDF. Maximum file size: 2MB
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="rounded-lg border-2 border-dashed p-4 md:p-6 text-center">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
                <div className="flex h-8 md:h-10 w-8 md:w-10 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-4 md:h-5 w-4 md:w-5" />
                </div>
                <p className="mt-2 text-xs md:text-sm font-medium">
                  Drag and drop your file here or
                </p>
                <Button
                  variant="link"
                  className="mt-1 h-auto p-0 text-xs md:text-sm"
                  onClick={handleBrowseFiles}
                  disabled={isUploading}
                >
                  click to browse
                </Button>
              </div>
            </div>
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5 md:h-2" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoModalOpen} onOpenChange={setIsLogoModalOpen}>
        <DialogContent className="max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Upload Company Logo
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Upload your company logo. Supported formats: PNG, JPG, JPEG or
              PDF. Maximum file size: 2MB
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <UploadField
              onChange={handleLogoUpload}
              value={logoUrl}
              accept="image/*"
              maxSize={2 * 1024 * 1024}
              label="Upload Logo"
              type="identity"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(BusinessProfileHeader);
