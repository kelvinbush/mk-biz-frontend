"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocType, BusinessDocument } from "@/lib/types/user";
import { Icons } from "@/components/icons";
import { downloadFile } from "@/lib/utils/document-download";
import { toast } from "@/components/ui/use-toast";

interface DownloadDocumentsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDocs: Set<string>;
  documentTypeNames: Record<DocType, string>;
  allDocuments: Map<number, BusinessDocument | null>;
}

export default function DownloadDocumentsModal({
  isOpen,
  onOpenChange,
  selectedDocs,
  documentTypeNames,
  allDocuments,
}: DownloadDocumentsModalProps) {
  const handleDownload = () => {
    // Download all selected documents
    Array.from(selectedDocs).forEach(async (docType) => {
      const doc = allDocuments.get(docType as unknown as number);
      if (doc && doc.docPath) {
        try {
          const filename = `${documentTypeNames[docType as unknown as DocType]}.${doc.docPath.split(".").pop()}`;
          await downloadFile(doc.docPath, filename);
        } catch (error) {
          console.error("Error downloading document:", error);
          toast({
            title: "Error",
            description: "Failed to download document",
            variant: "destructive",
          });
        }
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Selected Documents</DialogTitle>
          <DialogDescription>
            You have selected {selectedDocs.size} document(s) to download.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {Array.from(selectedDocs).map((docType) => {
              return (
                <div key={docType} className="flex items-center gap-2">
                  <Icons.docIcon className="h-4 w-4" />
                  <span className="text-sm">
                    {documentTypeNames[docType as unknown as DocType]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDownload}>Download</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
