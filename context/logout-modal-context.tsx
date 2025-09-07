"use client";

import React, { createContext, useContext, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logOut } from "@/lib/redux/features/authSlice";
import { useAuth } from "@clerk/nextjs";

interface LogoutModalContextType {
  showLogoutModal: () => void;
  hideLogoutModal: () => void;
}

const LogoutModalContext = createContext<LogoutModalContextType | undefined>(
  undefined,
);

export function LogoutModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
 const { signOut } = useAuth()
  const showLogoutModal = () => setIsOpen(true);
  const hideLogoutModal = () => setIsOpen(false);

  const handleLogout = async () => {
    await signOut()
    hideLogoutModal();
  };

  return (
    <LogoutModalContext.Provider value={{ showLogoutModal, hideLogoutModal }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader className="sm:text-center">
            <div className="mx-auto mb-4">
              <Icons.danger />
            </div>
            <div className="text-4xl font-medium">
              Are you sure you want to log out?
            </div>
            <div
              className="text-center text-xl mt-10 text-[#62696F]"
              style={{
                marginTop: "50px",
                marginBottom: "20px",
              }}
            >
              You can log back in anytime to continue where you left off
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
              No, Cancel
            </Button>
            <Button
              onClick={handleLogout}
              size={"lg"}
              style={{
                backgroundColor: "#A71525",
              }}
              className="px-9 hover:bg-gray-800"
            >
              Yes, Log Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </LogoutModalContext.Provider>
  );
}

export function useLogoutModal() {
  const context = useContext(LogoutModalContext);
  if (context === undefined) {
    throw new Error("useLogoutModal must be used within a LogoutModalProvider");
  }
  return context;
}
