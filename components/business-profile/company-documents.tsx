"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { userApiSlice } from "@/lib/redux/services/user";
import { BusinessDocument, DocType } from "@/lib/types/user";
import { Icons } from "@/components/icons";
import UploadDocumentModal from "./modals/upload-document-modal";
import UpdateDocumentModal from "./modals/update-document-modal";
import DownloadDocumentsModal from "./modals/download-documents-modal";
import Pagination from "./pagination";
import {
  ALLOWED_FILE_TYPES,
  BANKS,
  documentTypeNames,
  validateFile,
} from "@/lib/utils/document-utils";
import { EmptyState } from "./empty-state";
import { downloadFile } from "@/lib/utils/document-download";
import DocumentsTable from "./documents-table";
import { useDocumentManagement } from "@/hooks/use-document-management";

export default function CompanyDocuments() {
  const guid = useAppSelector(selectCurrentToken);
  const { data: businessProfile, isLoading } =
    userApiSlice.useGetBusinessProfileByPersonalGuidQuery(
      { guid: guid || "" },
      { skip: !guid },
    );

  const { data: documentResponse } = userApiSlice.useGetBusinessDocumentsQuery(
    { businessGuid: businessProfile?.business?.businessGuid || "" },
    { skip: !businessProfile?.business?.businessGuid },
  );

  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<BusinessDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [, setShowPin] = useState(false);
  const [, setShowUpdatePin] = useState(false);
  const [, setSelectedBank] = useState("");
  const [, setBankPin] = useState("");
  const [, setUpdateSelectedBank] = useState("");
  const [, setUpdateBankPin] = useState("");

  const documents = documentResponse?.documents || [];

  // Use our custom hook for document management
  const {
    currentDocuments,
    allDocuments,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    selectedDocs,
    setSelectedDocs,
    hasActiveFilters,
    noFilteredResults,
    resetFilters,
    filteredDocumentsCount,
  } = useDocumentManagement({
    documents,
    businessType: businessProfile?.business?.typeOfIncorporation,
    itemsPerPage: 5,
  });

  useEffect(() => {
    handlePageChange(1);
  }, [searchQuery, filterStatus]);

  const handleViewDocument = (doc: BusinessDocument) => {
    window.open(doc.docPath, "_blank");
  };

  const handleUploadDocument = (docType: DocType) => {
    setSelectedDocType(docType);
    setIsUploadModalOpen(true);
    setSelectedBank("");
    setBankPin("");
    setShowPin(false);
  };

  const handleEditDocument = (doc: BusinessDocument) => {
    setSelectedDocument(doc);
    setSelectedDocType(doc.docType);
    setIsUpdateModalOpen(true);
    setShowUpdatePin(false);
    if (doc.docType === DocType.AnnualBankStatement) {
      if (doc.docBankCode) {
        setUpdateSelectedBank(doc.docBankCode);
      }
      if (doc.docPin) {
        setUpdateBankPin(doc.docPin);
      }
    }
  };

  const handleDownloadDocument = async (doc: BusinessDocument) => {
    try {
      const filename = `${documentTypeNames[doc.docType]}.${doc.docPath.split(".").pop()}`;
      await downloadFile(doc.docPath, filename);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 md:space-y-6 p-4 md:p-6")}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div>
          <h2 className="text-xl md:text-2xl font-medium">Company Documents</h2>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-3 md:top-4 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-10 md:h-12 text-sm md:text-base w-full"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 bg-[#E8E9EA] h-10 md:h-12 text-sm md:text-base w-full md:w-auto"
              >
                <Icons.filter className="h-4 w-4" />
                {filterStatus === "all"
                  ? "All Documents"
                  : filterStatus.charAt(0).toUpperCase() +
                    filterStatus.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <DropdownMenuRadioItem value="all">
                  All Documents
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pending">
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="uploaded">
                  Uploaded
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {noFilteredResults && hasActiveFilters ? (
        <div className="rounded-lg border bg-card overflow-hidden">
          <EmptyState
            hasDocuments={allDocuments.size > 0}
            hasFilters={hasActiveFilters && noFilteredResults}
            onReset={resetFilters}
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <DocumentsTable
              currentDocuments={currentDocuments}
              documentTypeNames={documentTypeNames}
              selectedDocs={selectedDocs}
              setSelectedDocs={setSelectedDocs}
              onViewDocument={handleViewDocument}
              onEditDocument={handleEditDocument}
              onDownloadDocument={handleDownloadDocument}
              onUploadDocument={handleUploadDocument}
              businessType={
                businessProfile?.business?.typeOfIncorporation || ""
              }
            />
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-3 border-t gap-3 md:gap-0">
        <div className="flex items-center gap-1 text-xs md:text-sm text-gray-700">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredDocumentsCount)} of{" "}
          {filteredDocumentsCount} results
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredDocumentsCount}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        selectedDocType={selectedDocType}
        documentTypeNames={documentTypeNames}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        validateFile={validateFile}
        ALLOWED_FILE_TYPES={ALLOWED_FILE_TYPES}
        BANKS={BANKS}
        businessGuid={businessProfile?.business?.businessGuid || ""}
        businessType={businessProfile?.business?.typeOfIncorporation || ""}
        onUploadSuccess={() => {
          setSelectedDocType(null);
        }}
      />

      <UpdateDocumentModal
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        selectedDocument={selectedDocument}
        documentTypeNames={documentTypeNames}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        validateFile={validateFile}
        ALLOWED_FILE_TYPES={ALLOWED_FILE_TYPES}
        BANKS={BANKS}
        businessGuid={businessProfile?.business?.businessGuid || ""}
        businessType={businessProfile?.business?.typeOfIncorporation || ""}
        onUpdateSuccess={() => {
          setSelectedDocument(null);
          setSelectedDocType(null);
        }}
      />

      <DownloadDocumentsModal
        isOpen={isDownloadModalOpen}
        onOpenChange={setIsDownloadModalOpen}
        selectedDocs={selectedDocs}
        documentTypeNames={documentTypeNames}
        allDocuments={allDocuments}
      />

      {selectedDocs.size > 0 && (
        <div className="fixed bottom-8 right-[40%] z-50">
          <Button
            onClick={() => setIsDownloadModalOpen(true)}
            className="shadow-lg flex items-center gap-2 bg-primary-green hover:bg-primary-green/90"
          >
            <Icons.download className="h-4 w-4" />
            Download Selected ({
              selectedDocs.size
            })
          </Button>
        </div>
      )}
    </div>
  );
}
