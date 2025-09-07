import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FailureModalProps {
  isOpen: boolean;
  onClose: () => void;
  completionPercentage?: number;
  title?: string;
  message?: string;
  buttonText?: string;
  buttonLink?: string;
}

const FailureModal: React.FC<FailureModalProps> = ({
  isOpen,
  onClose,
  completionPercentage,
  title = "Profile Incomplete",
  message,
  buttonText = "Complete Profile",
  buttonLink = "/onboarding-checklist",
}) => {
  if (!isOpen) return null;

  // Use the provided message or generate one based on completion percentage
  const displayMessage = message || 
    `Your profile needs to be at least 80% complete before you can apply for a loan. ${
      completionPercentage ? `Current completion: ${completionPercentage}%.` : ''
    } Please complete your profile and try again.`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{displayMessage}</p>
          <Link href={buttonLink}>
            <Button className="w-full" onClick={onClose}>{buttonText}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FailureModal;
