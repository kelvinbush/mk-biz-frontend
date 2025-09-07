import { BusinessDocument, DocType } from "@/lib/types/user";

export const documentTypeNames: Record<DocType, string> = {
  [DocType.BusinessRegistration]: "Business Registration",
  [DocType.ArticlesOfAssociation]: "Articles of Association",
  [DocType.BusinessPermit]: "Business Permit",
  [DocType.TaxRegistrationDocument]: "Tax Registration Certificate",
  [DocType.AnnualBankStatement]: "Annual Bank Statement",
  [DocType.AuditedFinancialStatement]: "Management Accounts for the year 2024",
  [DocType.CertificateOfIncorporation]: "Certificate of Incorporation",
  [DocType.BusinessPlan]: "Business Plan",
  [DocType.PitchDeck]: "Pitch Deck or Company Profile",
  [DocType.TaxClearanceDocument]: "Tax Clearance Document",
  [DocType.BalanceCahsFlowIncomeStatement]: "Income Statements",
  [DocType.MemorandumOfAssociation]: "Memorandum of Association",
  [DocType.PartnershipDeed]: "Partnership Deed",
  [DocType.AuditedFinancialStatementyear2]:
    "Audited Financial Statement for the year 2023",
  [DocType.AuditedFinancialStatementyear3]:
    "Audited Financial Statement for the year 2022",
  [DocType.CarbonCreditCert]: "Carbon Credit Certificate",
  [DocType.SupportingDocument]: "Supporting Document",
};

export const requiredDocuments = [
  DocType.AuditedFinancialStatement,
  DocType.AuditedFinancialStatementyear2,
  DocType.AuditedFinancialStatementyear3,
  DocType.BalanceCahsFlowIncomeStatement,
];

export const soleProprietorRequiredDocuments = [
  DocType.BusinessRegistration,
  DocType.TaxRegistrationDocument,
  DocType.TaxClearanceDocument,
  DocType.AnnualBankStatement,
  DocType.BusinessPermit,
  DocType.PitchDeck,
  DocType.BusinessPlan,
  ...requiredDocuments,
];

export const companyRequiredDocuments = [
  DocType.BusinessRegistration,
  DocType.MemorandumOfAssociation,
  DocType.TaxClearanceDocument,
  DocType.AnnualBankStatement,
  DocType.BusinessPermit,
  DocType.PitchDeck,
  DocType.BusinessPlan,
  ...requiredDocuments,
];

export const partnerRequiredDocuments = [
  DocType.BusinessRegistration,
  DocType.PartnershipDeed,
  DocType.TaxClearanceDocument,
  DocType.AnnualBankStatement,
  DocType.BusinessPermit,
  DocType.PitchDeck,
  DocType.BusinessPlan,
  ...requiredDocuments,
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
};

export const validateFile = (file: File): string | null => {
  console.log("Validating file:", file);

  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return `Invalid file type. Allowed types are: ${Object.values(ALLOWED_FILE_TYPES).join(", ")}`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
  }

  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

export const getStatusBadgeStyles = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case "under review":
      return "text-[#1E429F] bg-[#E1EFFE] hover:text-[#1E429F] hover:bg-[#E1EFFE]";
    case "verified":
      return "text-[#007054] bg-[#B0EFDF] hover:text-[#007054] hover:bg-[#B0EFDF]";
    case "rejected":
      return "text-[#650D17] bg-[#E9B7BD] hover:text-[#650D17] hover:bg-[#E9B7BD]";
    case "pending":
      return "text-[#8C5E00] bg-[#FFE5B0] hover:text-[#8C5E00] hover:bg-[#FFE5B0]";
    default:
      return "text-[#1E429F] bg-[#E1EFFE] hover:text-[#1E429F] hover:bg-[#E1EFFE]";
  }
};

export const getDocumentStatus = (doc: BusinessDocument | null) => {
  if (!doc)
    return {
      text: "Pending",
      style:
        "text-[#8C5E00] bg-[#FFE5B0] hover:text-[#8C5E00] hover:bg-[#FFE5B0]",
    };

  if (!doc.status) {
    return {
      text: "Uploaded",
      style:
        "text-[#1E429F] bg-[#E1EFFE] hover:text-[#1E429F] hover:bg-[#E1EFFE]",
    };
  }

  return {
    text: doc.status,
    style: getStatusBadgeStyles(doc.status),
  };
};

// Bank options for the dropdown
export const BANKS = [
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
