import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  buttonLink?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Application Submitted!",
  message = "Your loan application has been submitted successfully. We'll review it and get back to you shortly.",
  buttonText = "Go to Loan Applications",
  buttonLink = "/loan-applications",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href={buttonLink}>
            <Button className="w-full" onClick={onClose}>{buttonText}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
