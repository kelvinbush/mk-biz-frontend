// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { useMemo, useRef, useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Download,
  FileText,
  Loader2,
  Search,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEdgeStore } from "@/lib/edgestore";
import { toast } from "@/components/ui/use-toast";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { userApiSlice } from "@/lib/redux/services/user";
import { Icons } from "@/components/icons";
import { withAuth } from "@/components/auth/RequireAuth";
import { useGetUserQuery } from "@/lib/redux/services/user";

enum DocumentType {
  NationalIdFront = 0,
  NationalIdBack = 1,
  Passport = 2,
  TaxComplaintDocument = 3,
  UserPhoto = 4,
}

interface PersonalDocument {
  id: number;
  docType: DocumentType;
  docPath: string;
  createdDate: string;
  modifiedDate: string | null;
  status?: string;
  remarks?: string;
}

const documentTypeNames: Record<DocumentType, string> = {
  [DocumentType.NationalIdFront]: "National ID (Front)",
  [DocumentType.NationalIdBack]: "National ID (Back)",
  [DocumentType.Passport]: "Passport Bio Page",
  [DocumentType.TaxComplaintDocument]: "Personal Tax Compliance Document",
  [DocumentType.UserPhoto]: "Passport Photo",
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];

const validateFile = (file: File): string | null => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `Invalid file type. Allowed types are: ${ALLOWED_FILE_TYPES.map((type) => type.split("/")[1].toUpperCase()).join(", ")}`;
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

const getStatusBadgeStyles = (status: string | undefined) => {
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

const getDocumentStatus = (doc: PersonalDocument | null) => {
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

function PersonalDocuments() {
  const guid = useAppSelector(selectCurrentToken);
  const { edgestore } = useEdgeStore();
  const [uploadPersonalDocument] =
    userApiSlice.useUploadPersonalDocumentMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const itemsPerPage = 5;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documentResponse } = userApiSlice.useGetPersonalDocumentsQuery(
    { personalGuid: guid || "" },
    { skip: !guid },
  );

  const { data: user } = useGetUserQuery({ guid });

  const documents = documentResponse?.documents || [];

  // Determine required docs based on user's chosen identity document type
  const requiredDocTypes = useMemo(() => {
    const base = [DocumentType.TaxComplaintDocument, DocumentType.UserPhoto];
    const idType = user?.personal?.identityDocType?.toLowerCase();
    if (idType === "passport") {
      return [...base, DocumentType.Passport];
    }
    // Default to National ID requirement when not passport
    return [...base, DocumentType.NationalIdFront, DocumentType.NationalIdBack];
  }, [user]);

  // Create a map of all required documents, including missing ones
  const allDocuments = useMemo(() => {
    const documentMap = new Map<DocumentType, PersonalDocument | null>();

    // Initialize with required documents as null (missing)
    requiredDocTypes.forEach((docType) => {
      documentMap.set(docType, null);
    });

    // Update with existing documents
    documents.forEach((doc) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      documentMap.set(doc.docType, doc);
    });

    return documentMap;
  }, [documents, requiredDocTypes]);

  const filteredDocuments = useMemo(() => {
    // Display only the required document types for this user
    const displayDocTypes = [...requiredDocTypes];

    return Array.from(allDocuments.entries()).filter(([docType, doc]) => {
      if (!displayDocTypes.includes(docType)) return false;

      const name = documentTypeNames[docType]?.toLowerCase();
      const matchesSearch = name?.includes(searchQuery.toLowerCase());

      if (filter === "all") return matchesSearch;

      const status = doc ? "uploaded" : "pending";
      return matchesSearch && status === filter.toLowerCase();
    });
  }, [allDocuments, searchQuery, filter, requiredDocTypes]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredDocuments.length,
  );
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  const generatePaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);

    if (totalPages <= 1) return range;

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    range.push(totalPages);

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handleViewDocument = (doc: PersonalDocument) => {
    window.open(doc.docPath, "_blank");
  };

  const handleUploadDocument = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setIsUploadModalOpen(true);
  };

  const handleUpdateDocument = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setIsUploadModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFileUpload = async (file: File) => {
    if (!guid) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    if (selectedDocType === null) {
      toast({
        title: "Error",
        description: "No document type selected",
        variant: "destructive",
      });
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Upload to Edgestore
      const res = await edgestore.publicFiles.upload({
        file,
        input: { type: "document" },
        onProgressChange: (progress) => {
          console.log("Upload progress:", progress);
        },
      });

      // Upload to backend - same endpoint for both upload and update
      await uploadPersonalDocument({
        path: res.url,
        docType: selectedDocType,
        personalGuid: guid,
      });

      setIsUploadModalOpen(false);
      setSelectedDocType(null);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (doc: PersonalDocument) => {
    try {
      const filename = `${documentTypeNames[doc.docType]}.${doc.docPath.split(".").pop()}`;
      await downloadFile(doc.docPath, filename);
      toast({
        title: "Success",
        description: "Document downloaded successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleBulkDownload = async () => {
    const selectedDocuments = Array.from(selectedDocs)
      .map((docType) => {
        const doc = allDocuments.get(parseInt(docType));
        return doc;
      })
      .filter((doc): doc is PersonalDocument => doc !== null);

    if (selectedDocuments.length === 0) {
      toast({
        title: "Error",
        description: "No documents selected for download",
        variant: "destructive",
      });
      return;
    }

    setIsDownloadModalOpen(false);

    for (const doc of selectedDocuments) {
      await handleDownloadDocument(doc);
    }

    toast({
      title: "Success",
      description: `${selectedDocuments.length} documents downloaded successfully`,
      variant: "default",
    });
  };

  return (
    <div className={cn("space-y-4 md:space-y-6 p-4 md:p-6")}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div>
          <h2 className="text-xl md:text-2xl font-medium">
            Personal Documents
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-3 md:top-4 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-10 md:h-12 w-full"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-[#E8E9EA] h-10 md:h-12 w-full md:w-auto text-sm md:text-base"
                >
                  <Icons.filter className="h-4 w-4" />
                  {filter === "all"
                    ? "All Documents"
                    : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={filter}
                  onValueChange={setFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    All Documents
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="uploaded">
                    Uploaded
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending">
                    Pending
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader className={"bg-[#E8E9EA]"}>
              <TableRow className="hover:bg-transparent uppercase">
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={
                      currentDocuments.length > 0 &&
                      currentDocuments.every(([docType]) =>
                        selectedDocs.has(docType.toString()),
                      )
                    }
                    onChange={(e) => {
                      const newSelected = new Set(selectedDocs);
                      if (e.target.checked) {
                        currentDocuments.forEach(([docType]) =>
                          newSelected.add(docType.toString()),
                        );
                      } else {
                        currentDocuments.forEach(([docType]) =>
                          newSelected.delete(docType.toString()),
                        );
                      }
                      setSelectedDocs(newSelected);
                    }}
                  />
                </TableHead>
                <TableHead className="w-[50%] text-xs text-[#151F28]">
                  Document Name
                </TableHead>
                <TableHead className="w-[20%] text-xs text-[#151F28]">
                  Status
                </TableHead>
                <TableHead className="w-[30%] text-xs text-[#151F28] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDocuments.map(([docType, doc]) => (
                <TableRow key={docType} className="hover:bg-gray-50">
                  <TableCell className="w-[40px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectedDocs.has(docType.toString())}
                      onChange={(e) => {
                        const newSelected = new Set(selectedDocs);
                        if (e.target.checked) {
                          newSelected.add(docType.toString());
                        } else {
                          newSelected.delete(docType.toString());
                        }
                        setSelectedDocs(newSelected);
                      }}
                      disabled={!doc}
                    />
                  </TableCell>
                  <TableCell className="py-3 md:py-4">
                    <div className="flex items-start gap-x-2 md:gap-x-4">
                      <Icons.docIcon className="h-4 w-4" />
                      <div className={"-mt-1"}>
                        <p className="font-medium text-midnight-blue text-xs md:text-sm">
                          {documentTypeNames[docType]}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md font-medium border-none text-xs md:text-sm",
                        getDocumentStatus(doc).style,
                      )}
                    >
                      {getDocumentStatus(doc).text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {doc ? (
                      <div className="flex flex-wrap gap-1 md:gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                          className="gap-1 text-deep-blue-500 hover:text-deep-blue-400 text-xs md:text-sm px-1 md:px-2 h-8"
                        >
                          <Icons.view className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateDocument(docType)}
                          className="gap-1 text-primary-green hover:text-primary-green/80 text-xs md:text-sm px-1 md:px-2 h-8"
                        >
                          <Icons.edit className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden md:inline">Update</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc)}
                          className="gap-1 text-midnight-blue hover:text-midnight-blue/80 text-xs md:text-sm px-1 md:px-2 h-8"
                        >
                          <Icons.download className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden md:inline">Download</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadDocument(docType)}
                        className="gap-1 text-xs md:text-sm h-8"
                      >
                        <Upload className="h-3 w-3 md:h-4 md:w-4" />
                        Upload
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-3 border-t gap-3 md:gap-0">
            <div className="flex items-center gap-1 text-xs md:text-sm text-gray-700 order-2 md:order-1">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredDocuments.length)} of{" "}
              {filteredDocuments.length} results
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 md:gap-2 order-1 md:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-7 md:h-8 w-7 md:w-8 p-0"
                >
                  <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="sr-only">Previous</span>
                </Button>

                {generatePaginationNumbers().map((pageNum, index) => (
                  <Button
                    key={index}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      typeof pageNum === "number" && handlePageChange(pageNum)
                    }
                    disabled={pageNum === "..."}
                    className={cn(
                      "h-7 md:h-8 w-7 md:w-8 p-0 text-xs md:text-sm",
                      pageNum === currentPage &&
                        "bg-gradient-to-r from-[#8AF2F2] to-[#54DDBB] text-midnight-blue hover:from-[#8AF2F2] hover:to-[#54DDBB] hover:text-midnight-blue",
                      pageNum === "..." &&
                        "cursor-default hover:bg-transparent",
                    )}
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-7 md:h-8 w-7 md:w-8 p-0"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md max-w-[90%]">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {selectedDocType !== null
                ? documentTypeNames[selectedDocType]
                : "Document"}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Upload your document in PDF, PNG, or JPG format. Maximum file size
              is 2MB.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-4 md:p-8 transition-colors hover:bg-gray-50",
                isUploading && "pointer-events-none opacity-50",
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-blue-50 p-2 md:p-3">
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin text-blue-600" />
                  ) : (
                    <Cloud className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs md:text-sm font-medium">
                    {isUploading
                      ? "Uploading..."
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, PNG or JPG (max. 2MB)
                  </p>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={ALLOWED_FILE_TYPES.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
              />
            </div>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedDocType(null);
              }}
              className="h-9 md:h-10 text-xs md:text-sm"
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Download Modal */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Download Selected Documents
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              You have selected {selectedDocs.size} document(s) to download.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-[150px] md:max-h-[200px] overflow-y-auto space-y-2 p-2">
              {Array.from(selectedDocs).map((docType) => {
                allDocuments.get(parseInt(docType));
                return (
                  <div key={docType} className="flex items-center gap-2">
                    <FileText className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="text-xs md:text-sm">
                      {documentTypeNames[parseInt(docType)]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="h-9 md:h-10 text-xs md:text-sm"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleBulkDownload}
                className="h-9 md:h-10 text-xs md:text-sm"
              >
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Download Button */}
      {selectedDocs.size > 0 && (
        <div className="fixed bottom-4 md:bottom-8 right-4 md:right-[40%] z-50">
          <Button
            onClick={() => setIsDownloadModalOpen(true)}
            className="shadow-lg flex items-center gap-2 bg-primary-green hover:bg-primary-green/90 h-9 md:h-10 text-xs md:text-sm px-3 md:px-4"
          >
            <Download className="h-3 w-3 md:h-4 md:w-4" />
            Download Selected ({
              selectedDocs.size
            })
          </Button>
        </div>
      )}
    </div>
  );
}

export default withAuth(PersonalDocuments);
