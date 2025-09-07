"use client";

import Sidenav from "@/components/dashboard/dashboard-sidebar";
import Topnav from "@/components/dashboard/topnav";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const toggleButton = document.getElementById("sidebar-toggle");

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node) &&
        isMobile
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile]);

  return (
    <div className="relative min-h-svh bg-[#E8E9EA]">
      {/* Mobile sidebar toggle button */}
      {!sidebarOpen && (
        <Button
          id="sidebar-toggle"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed left-4 top-3.5 z-40 md:hidden flex items-center justify-center"
        >
          <Menu className="h-5 w-5 text-midnight-blue" />
        </Button>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed left-0 top-0 z-30 h-full transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidenav onCloseSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Topnav and main content */}
      <Topnav />
      <main className="max-w-[2000px] py-4 px-4 pt-4 md:pl-[308px]">
        {children}
      </main>
    </div>
  );
}
