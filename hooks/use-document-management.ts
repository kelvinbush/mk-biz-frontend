import { useMemo, useState } from "react";
import { BusinessDocument, DocType } from "@/lib/types/user";
import {
  companyRequiredDocuments,
  documentTypeNames,
  getDocumentStatus,
  partnerRequiredDocuments,
  soleProprietorRequiredDocuments,
} from "@/lib/utils/document-utils";

interface UseDocumentManagementProps {
  documents: BusinessDocument[];
  businessType?: string;
  itemsPerPage?: number;
}

export function useDocumentManagement({
  documents,
  businessType,
  itemsPerPage = 5,
}: UseDocumentManagementProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // Determine required documents based on business type
  const getRequiredDocuments = () => {
    const incorporationType = businessType?.toLowerCase();

    switch (incorporationType) {
      case "private-limited-company":
      case "public-limited-company":
      case "limited-liability-company-llc":
      case "s-corporation":
      case "c-corporation":
        return companyRequiredDocuments;
      case "general-partnership":
      case "limited-liability-partnership-llp":
        return partnerRequiredDocuments;
      case "sole-proprietorship":
        return soleProprietorRequiredDocuments;
      default:
        return soleProprietorRequiredDocuments; // Default to sole proprietor if type is unknown
    }
  };

  // Create a map of all documents (existing and required)
  const allDocuments = useMemo(() => {
    const documentMap = new Map<number, BusinessDocument | null>();

    // Initialize with all required documents as null (missing)
    const requiredDocuments = getRequiredDocuments();
    requiredDocuments.forEach((docType) => {
      documentMap.set(docType, null);
    });

    // Update with existing documents
    documents.forEach((doc: BusinessDocument | null) => {
      if (doc && typeof doc.docType === "number") {
        documentMap.set(doc.docType, doc);
      }
    });

    return documentMap;
  }, [documents, businessType]);

  // Filter documents based on search query and status filter
  const filteredDocuments = useMemo(() => {
    return Array.from(allDocuments.entries()).filter(([docType, doc]) => {
      const name =
        documentTypeNames[docType as unknown as DocType]?.toLowerCase();
      const matchesSearch = name?.includes(searchQuery.toLowerCase());

      if (filterStatus === "all") return matchesSearch;

      const status = getDocumentStatus(doc).text.toLowerCase();
      return matchesSearch && status === filterStatus.toLowerCase();
    });
  }, [allDocuments, searchQuery, filterStatus]);

  // Calculate pagination data
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredDocuments.length
  );
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
  };

  // Check if there are active filters
  const hasActiveFilters = searchQuery.length > 0 || filterStatus !== "all";
  const noFilteredResults = filteredDocuments.length === 0;

  return {
    // Data
    allDocuments,
    filteredDocuments,
    currentDocuments,
    filteredDocumentsCount: filteredDocuments.length,
    
    // Pagination
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    
    // Filtering
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    hasActiveFilters,
    noFilteredResults,
    resetFilters,
    
    // Selection
    selectedDocs,
    setSelectedDocs,
  };
}
