// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { userApiSlice } from "@/lib/redux/services/user";
import { DocType } from "@/lib/types/user";

// Required document types with their respective weights
const REQUIRED_DOCUMENTS = {
  [DocType.BusinessRegistration]: {
    type: DocType.BusinessRegistration,
    weight: 8,
  },
  [DocType.CertificateOfIncorporation]: {
    type: DocType.CertificateOfIncorporation,
    weight: 8,
  },
  [DocType.PartnershipDeed]: {
    type: DocType.PartnershipDeed,
    weight: 8,
  },
  [DocType.TaxRegistrationDocument]: {
    type: DocType.TaxRegistrationDocument,
    weight: 7,
  },
  [DocType.BusinessPermit]: {
    type: DocType.BusinessPermit,
    weight: 7,
  },
  [DocType.AnnualBankStatement]: {
    type: DocType.AnnualBankStatement,
    weight: 6,
  },
  [DocType.BusinessPlan]: {
    type: DocType.BusinessPlan,
    weight: 7,
  },
  [DocType.PitchDeck]: {
    type: DocType.PitchDeck,
    weight: 6,
  },
} as const;

const soleProprietorRequiredDocuments = [
  DocType.BusinessRegistration,
  DocType.TaxRegistrationDocument,
  DocType.BusinessPermit,
  DocType.AnnualBankStatement,
  DocType.PitchDeck,
];

const companyRequiredDocuments = [
  DocType.BusinessRegistration,
  DocType.MemorandumOfAssociation,
  DocType.TaxRegistrationDocument,
  DocType.AnnualBankStatement,
  DocType.PitchDeck,
];

const partnerRequiredDocuments = [
  DocType.PartnershipDeed,
  DocType.TaxRegistrationDocument,
  DocType.AnnualBankStatement,
  DocType.BusinessPermit,
  DocType.PitchDeck,
];

// Calculate total weights for each business type
const calculateTotalWeight = (docs: DocType[]) =>
  docs.reduce((sum, doc) => sum + (REQUIRED_DOCUMENTS[doc]?.weight || 0), 0);

const TOTAL_WEIGHTS = {
  soleProprietor: calculateTotalWeight(soleProprietorRequiredDocuments),
  company: calculateTotalWeight(companyRequiredDocuments),
  partner: calculateTotalWeight(partnerRequiredDocuments),
};

// Required business profile fields with their respective weights
const REQUIRED_BUSINESS_FIELDS = {
  businessName: { weight: 4 },
  businessDescription: { weight: 3 },
  typeOfIncorporation: { weight: 3 },
  sector: { weight: 3 },
  country: { weight: 2 },
  city: { weight: 2 },
  postalCode: { weight: 2 },
  averageAnnualTurnover: { weight: 4 },
  averageMonthlyTurnover: { weight: 3 },
  yearOfRegistration: { weight: 2 }, // Year of incorporation/founding
  street1: { weight: 4 },
  previousLoans: { weight: 2 },
} as const;

// Calculate total weights
const TOTAL_PROFILE_WEIGHT = Object.values(REQUIRED_BUSINESS_FIELDS).reduce(
  (sum, field) => sum + field.weight,
  0,
);

export const useCompletionPercentage = () => {
  const [completionPercentage, setCompletionPercentage] = useState(50);
  const [profilePercentage, setProfilePercentage] = useState(0);
  const [documentsPercentage, setDocumentsPercentage] = useState(0);
  const guid = useAppSelector(selectCurrentToken);

  const { data: businessProfile } =
    userApiSlice.useGetBusinessProfileByPersonalGuidQuery(
      { guid: guid || "" },
      { skip: !guid },
    );

  const { data: documentResponse } = userApiSlice.useGetBusinessDocumentsQuery(
    { businessGuid: businessProfile?.business?.businessGuid || "" },
    { skip: !businessProfile?.business?.businessGuid },
  );

  // Check if a field has a valid value
  const isFieldValid = (value: any, fieldName?: string): boolean => {
    if (value === null || value === undefined) return false;

    if (typeof value === "boolean") {
      return true; // Any boolean value (true/false) is valid
    }

    if (typeof value === "number") {
      return !isNaN(value); // Accept any valid number, including 0
    }

    if (typeof value === "string") {
      // Special handling for postal code - allow any non-empty string
      if (fieldName === "postalCode") {
        return value.trim() !== "";
      }
      // For other string fields, ensure minimum length
      return value.trim().length >= 2;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return false;
  };

  // Calculate business profile completion
  const calculateProfileCompletion = () => {
    if (!businessProfile?.business) return 0;

    let completedWeight = 0;
    const missingFields: string[] = [];

    Object.entries(REQUIRED_BUSINESS_FIELDS).forEach(
      ([fieldName, { weight }]) => {
        const value =
          businessProfile.business[
            fieldName as keyof typeof businessProfile.business
          ];
        if (isFieldValid(value, fieldName)) {
          completedWeight += weight;
        } else {
          missingFields.push(fieldName);
        }
      },
    );

    // Log missing fields for debugging
    if (missingFields.length > 0) {
      console.debug("Missing or invalid business profile fields:", {
        missingFields,
        currentValues: missingFields.reduce(
          (acc, field) => ({
            ...acc,
            [field]:
              businessProfile.business[
                field as keyof typeof businessProfile.business
              ],
          }),
          {},
        ),
      });
    }

    const percentage = Math.round(
      (completedWeight / TOTAL_PROFILE_WEIGHT) * 100,
    );
    console.debug("Business Profile Completion:", {
      completedWeight,
      totalWeight: TOTAL_PROFILE_WEIGHT,
      percentage: percentage + "%",
    });
    return percentage;
  };

  // Calculate document completion based on incorporation type
  const calculateDocumentCompletion = () => {
    if (!documentResponse?.documents) return 0;

    const uploadedDocTypes = new Set(
      documentResponse.documents.map((doc) => doc.docType),
    );

    // Get required documents based on incorporation type
    const getRequiredDocuments = () => {
      const businessType =
        businessProfile?.business?.typeOfIncorporation?.toLowerCase();
      switch (businessType) {
        case "sole-proprietorship":
          return {
            docs: soleProprietorRequiredDocuments,
            totalWeight: TOTAL_WEIGHTS.soleProprietor,
          };
        case "general-partnership":
        case "limited-partnership":
          return {
            docs: partnerRequiredDocuments,
            totalWeight: TOTAL_WEIGHTS.partner,
          };
        case "limited-liability-partnership-llp":
        case "limited-liability-company-llc":
        case "private-limited-company":
        case "public-limited-company":
        case "s-corporation":
        case "c-corporation":
        case "non-profit-organization":
          return {
            docs: companyRequiredDocuments,
            totalWeight: TOTAL_WEIGHTS.company,
          };
        default:
          console.debug("Unknown business type:", businessType);
          return {
            docs: soleProprietorRequiredDocuments,
            totalWeight: TOTAL_WEIGHTS.soleProprietor,
          };
      }
    };

    const { docs: requiredDocs, totalWeight } = getRequiredDocuments();
    let completedWeight = 0;
    const missingDocs: string[] = [];

    requiredDocs.forEach((docType) => {
      if (uploadedDocTypes.has(docType)) {
        completedWeight += REQUIRED_DOCUMENTS[docType]?.weight || 0;
      } else {
        missingDocs.push(docType);
      }
    });

    // Enhanced debugging information
    console.debug("Document completion details:", {
      businessType: businessProfile?.business?.typeOfIncorporation,
      requiredDocuments: requiredDocs,
      uploadedDocuments: Array.from(uploadedDocTypes).map((type) => ({
        type,
        weight: REQUIRED_DOCUMENTS[type]?.weight || 0,
      })),
      missingDocuments: missingDocs.map((docType) => ({
        type: docType,
        weight: REQUIRED_DOCUMENTS[docType]?.weight || 0,
        description: getDocumentDescription(docType),
      })),
      completedWeight,
      totalWeight,
    });

    const percentage = Math.round((completedWeight / totalWeight) * 100);
    return percentage;
  };

  // Temporary debug function
  const debugDocumentState = () => {
    const uploadedDocTypes = documentResponse?.documents
      ? new Set(documentResponse.documents.map((doc) => doc.docType))
      : new Set();

    const businessType =
      businessProfile?.business?.typeOfIncorporation?.toLowerCase() ||
      "unknown";

    let requiredDocs;
    switch (businessType) {
      case "sole-proprietorship":
        requiredDocs = soleProprietorRequiredDocuments;
        break;
      case "general-partnership":
        requiredDocs = partnerRequiredDocuments;
        break;
      case "limited-liability-partnership-llp":
      case "limited-liability-company-llc":
      case "private-limited-company":
      case "public-limited-company":
      case "s-corporation":
      case "c-corporation":
      case "non-profit-organization":
        requiredDocs = companyRequiredDocuments;
        break;
      default:
        requiredDocs = soleProprietorRequiredDocuments;
    }

    console.debug("Document State Analysis:", {
      businessType,
      uploadedDocuments: Array.from(uploadedDocTypes).map((type) => ({
        type,
        weight: REQUIRED_DOCUMENTS[type]?.weight || 0,
      })),
      missingDocuments: requiredDocs
        .filter((type) => !uploadedDocTypes.has(type))
        .map((type) => ({
          type,
          weight: REQUIRED_DOCUMENTS[type]?.weight || 0,
          description: getDocumentDescription(type),
        })),
    });
  };

  // Helper function to get document descriptions
  const getDocumentDescription = (docType: string) => {
    switch (docType) {
      case DocType.BusinessRegistration:
        return "Business Registration Certificate";
      case DocType.BusinessPermit:
        return "Business Operating Permit";
      case DocType.AnnualBankStatement:
        return "Annual Bank Statement";
      case DocType.BusinessPlan:
        return "Business Plan Document";
      case DocType.PitchDeck:
        return "Pitch Deck Presentation";
      case DocType.TaxRegistrationDocument:
        return "Tax Registration Document";
      case DocType.CertificateOfIncorporation:
        return "Certificate of Incorporation";
      case DocType.MemorandumOfAssociation:
        return "Memorandum of Association";
      case DocType.PartnershipDeed:
        return "Partnership Deed Agreement";
      default:
        return docType;
    }
  };

  useEffect(() => {
    debugDocumentState();
    // Base percentage starts at 20% just for having started the process
    const basePercentage = 20;

    // Calculate percentages for profile and documents
    const rawProfilePercent = calculateProfileCompletion();
    const rawDocumentPercent = calculateDocumentCompletion();

    // Profile completion contributes 40% to the total
    const weightedProfilePercent = Math.round(rawProfilePercent * 0.4);
    // Document completion contributes 40% to the total
    const weightedDocumentPercent = Math.round(rawDocumentPercent * 0.4);

    // Set individual percentages for UI display
    setProfilePercentage(rawProfilePercent);
    setDocumentsPercentage(rawDocumentPercent);

    // Calculate overall percentage:
    // 20% base + 40% from profile + 40% from documents
    const overallPercentage = Math.min(
      100,
      basePercentage + weightedProfilePercent + weightedDocumentPercent,
    );

    console.debug("Completion Percentages:", {
      base: basePercentage + "%",
      profile: {
        raw: rawProfilePercent + "%",
        weighted: weightedProfilePercent + "%",
      },
      documents: {
        raw: rawDocumentPercent + "%",
        weighted: weightedDocumentPercent + "%",
      },
      overall: overallPercentage + "%",
    });

    setCompletionPercentage(overallPercentage);
  }, [documentResponse, businessProfile]);

  // Check if business profile is complete
  const isBusinessProfileComplete = () => {
    if (!businessProfile?.business) {
      console.debug("Business profile is null or undefined");
      return false;
    }

    const missingFields: string[] = [];

    // Check all required fields
    const hasAllRequiredFields = Object.keys(REQUIRED_BUSINESS_FIELDS).every(
      (fieldName) => {
        const value =
          businessProfile.business[
            fieldName as keyof typeof businessProfile.business
          ];
        const isValid = isFieldValid(value, fieldName);

        if (!isValid) {
          missingFields.push(fieldName);
        }
        return isValid;
      },
    );

    // Log missing fields for debugging
    if (missingFields.length > 0) {
      console.debug("Missing or invalid business profile fields:", {
        missingFields,
        currentValues: missingFields.reduce(
          (acc, field) => ({
            ...acc,
            [field]:
              businessProfile.business[
                field as keyof typeof businessProfile.business
              ],
          }),
          {},
        ),
      });
    }

    // Additional validation based on incorporation type
    const incorporationType =
      businessProfile.business.typeOfIncorporation?.toLowerCase();
    if (!incorporationType) {
      console.debug("Missing incorporation type");
      return false;
    }

    // Add specific validations based on incorporation type if needed
    switch (incorporationType) {
      case "sole-proprietorship":
      case "general-partnership":
      case "limited-liability-partnership-llp":
      case "limited-liability-company-llc":
      case "private-limited-company":
      case "public-limited-company":
      case "s-corporation":
      case "c-corporation":
      case "non-profit-organization":
        return hasAllRequiredFields;
      default:
        console.debug("Invalid incorporation type:", incorporationType);
        return false;
    }
  };

  // Check if all required documents are uploaded
  const isDocumentsComplete = () => {
    if (
      !documentResponse?.documents ||
      !businessProfile?.business?.typeOfIncorporation
    ) {
      return false;
    }

    const businessType =
      businessProfile.business.typeOfIncorporation.toLowerCase();
    let requiredDocs: DocType[] = [];

    // Determine which documents are required based on business type
    if (businessType === "sole-proprietorship") {
      requiredDocs = soleProprietorRequiredDocuments;
    } else if (
      ["general-partnership", "limited-partnership"].includes(businessType)
    ) {
      requiredDocs = partnerRequiredDocuments;
    } else if (
      [
        "limited-liability-partnership-llp",
        "limited-liability-company-llc",
        "private-limited-company",
        "public-limited-company",
        "s-corporation",
        "c-corporation",
        "non-profit-organization",
      ].includes(businessType)
    ) {
      requiredDocs = companyRequiredDocuments;
    } else {
      // Default to sole proprietor if type is unknown
      requiredDocs = soleProprietorRequiredDocuments;
    }

    const uploadedDocTypes = new Set(
      documentResponse.documents.map((doc) => doc.docType),
    );

    // Check if all required documents for this business type are uploaded
    const allRequiredDocsUploaded = requiredDocs.every((docType) =>
      uploadedDocTypes.has(docType),
    );

    return allRequiredDocsUploaded;
  };

  return {
    completionPercentage,
    profilePercentage,
    documentsPercentage,
    isBusinessProfileComplete: isBusinessProfileComplete(),
    isDocumentsComplete: isDocumentsComplete(),
    isComplete: isBusinessProfileComplete() && isDocumentsComplete(),
  };
};
