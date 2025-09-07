import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { UploadField } from "@/components/auth/upload-field";

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
}

export function UploadPhotoModal({
  isOpen,
  onClose,
  onUploadComplete,
}: UploadPhotoModalProps) {
  const [photoUrl, setPhotoUrl] = useState("");

  const handleUploadComplete = (url: string) => {
    setPhotoUrl(url);
    onUploadComplete(url);
    onClose();
    toast({
      title: "Success",
      description: "Profile photo updated successfully",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Profile Photo</DialogTitle>
          <DialogDescription>
            Choose a photo to use as your profile picture. The photo should be
            clear and show your face.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <UploadField
            onChange={handleUploadComplete}
            value={photoUrl}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
            label="Profile Photo"
            type="identity"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
