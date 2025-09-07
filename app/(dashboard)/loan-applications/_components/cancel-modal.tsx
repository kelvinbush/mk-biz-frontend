import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface CancelModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const CancelModal = ({ isOpen, setIsOpen }: CancelModalProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader className="sm:text-center">
            <div className="mx-auto mb-4">
              <Icons.danger />
            </div>
            <div className="text-4xl font-medium">
              Are you sure you want to cancel this loan application?
            </div>
            <div
              className="text-center text-xl mt-10 text-[#62696F]"
              style={{
                marginTop: "50px",
                marginBottom: "20px",
              }}
            >
              If you cancel, you may need to restart the application process.
            </div>
          </DialogHeader>
          <div className="flex justify-center mt-4 gap-8 items-center">
            <Button
              onClick={() => setIsOpen(false)}
              size={"lg"}
              variant={"outline"}
              style={{
                borderColor: isHovered ? "#1f2937" : "#A71525",
                color: isHovered ? "white" : "#A71525",
                backgroundColor: isHovered ? "#1f2937" : "transparent",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="border-[#A71525] text-[#A71525] hover:bg-gray-800 px-9 hover:text-white"
            >
              No, Go Back
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              size={"lg"}
              style={{
                backgroundColor: "#A71525",
              }}
              className="px-9 hover:bg-gray-800"
            >
              Yes, Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CancelModal;
