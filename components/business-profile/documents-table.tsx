import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { BusinessDocument, DocType } from "@/lib/types/user";
import { getDocumentStatus } from "@/lib/utils/document-utils";

interface DocumentsTableProps {
  currentDocuments: [number, BusinessDocument | null][];
  documentTypeNames: Record<DocType, string>;
  selectedDocs: Set<string>;
  setSelectedDocs: (docs: Set<string>) => void;
  onViewDocument: (doc: BusinessDocument) => void;
  onEditDocument: (doc: BusinessDocument) => void;
  onDownloadDocument: (doc: BusinessDocument) => Promise<void>;
  onUploadDocument: (docType: DocType) => void;
  businessType: string;
}

export default function DocumentsTable({
  currentDocuments,
  documentTypeNames,
  selectedDocs,
  setSelectedDocs,
  onViewDocument,
  onEditDocument,
  onDownloadDocument,
  onUploadDocument,
  businessType,
}: DocumentsTableProps) {
  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedDocs);
    if (checked) {
      currentDocuments.forEach(([docType]) =>
        newSelected.add(docType.toString()),
      );
    } else {
      currentDocuments.forEach(([docType]) =>
        newSelected.delete(docType.toString()),
      );
    }
    setSelectedDocs(newSelected);
  };

  const handleSelectDocument = (docType: number, checked: boolean) => {
    const newSelected = new Set(selectedDocs);
    if (checked) {
      newSelected.add(docType.toString());
    } else {
      newSelected.delete(docType.toString());
    }
    setSelectedDocs(newSelected);
  };

  const allSelected =
    currentDocuments.length > 0 &&
    currentDocuments.every(([docType]) => selectedDocs.has(docType.toString()));

  return (
    <Table>
      <TableHeader className={"bg-[#E8E9EA]"}>
        <TableRow className="hover:bg-transparent uppercase">
          <TableHead className="w-[40px]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </TableHead>
          <TableHead className="w-[40%] text-xs text-[#151F28]">
            Document Name
          </TableHead>
          <TableHead className="w-[20%] text-xs text-[#151F28] hidden md:table-cell">
            Status
          </TableHead>
          <TableHead className="w-[20%] text-xs text-[#151F28] text-right">
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
                onChange={(e) =>
                  handleSelectDocument(docType, e.target.checked)
                }
                disabled={!doc}
              />
            </TableCell>
            <TableCell className="py-3 md:py-4">
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-x-4">
                <Icons.docIcon className="h-4 w-4" />
                <div className={"-mt-1"}>
                  <p className="font-medium text-midnight-blue text-sm">
                    {(() => {
                      const docName = documentTypeNames[docType as unknown as DocType];
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
                    })()}
                  </p>
                  {/* Mobile-only status display */}
                  <div className="md:hidden mt-1 flex flex-col gap-1">
                    {doc ? (
                      <Badge
                        className={cn(
                          "font-medium shadow-none rounded-md w-fit",
                          getDocumentStatus(doc).style,
                        )}
                      >
                        {getDocumentStatus(doc).text}
                      </Badge>
                    ) : (
                      <Badge
                        className={cn(
                          "font-medium shadow-none rounded-md w-fit",
                          "text-[#8C5E00] bg-[#FFE5B0]",
                        )}
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {doc ? (
                <Badge
                  className={cn(
                    "font-medium shadow-none rounded-md",
                    getDocumentStatus(doc).style,
                  )}
                >
                  {getDocumentStatus(doc).text}
                </Badge>
              ) : (
                <Badge
                  className={cn(
                    "font-medium shadow-none rounded-md",
                    "text-[#8C5E00] bg-[#FFE5B0]",
                  )}
                >
                  Pending
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              {doc ? (
                <div className="flex flex-col md:flex-row gap-2 md:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDocument(doc)}
                    className="gap-1 text-deep-blue-500 hover:text-deep-blue-400 text-sm justify-start md:justify-center"
                  >
                    <Icons.view className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditDocument(doc)}
                    className="gap-2 text-primary-green hover:text-primary-green/80 text-sm justify-start md:justify-center"
                  >
                    <Icons.edit className="h-4 w-4" />
                    Update
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadDocument(doc)}
                    className="gap-2 text-midnight-blue hover:text-midnight-blue/80 text-sm justify-start md:justify-center"
                  >
                    <Icons.download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onUploadDocument(docType as unknown as DocType)
                  }
                  className="gap-2 w-full md:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
