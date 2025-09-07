import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setTitle } from "@/lib/redux/features/top-bar.slice";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCompletionPercentage } from "@/hooks/use-completion-percentage";
import { useLogoutModal } from "@/context/logout-modal-context";

const sidenavLinks = [
  {
    title: "Dashboard",
    href: "/",
    icon: <Icons.dashboard />,
  },
  {
    title: "Profile",
    href: "/my-profile",
    icon: <Icons.profilesIcon />,
    children: [
      {
        title: "My Profile",
        href: "/my-profile",
        icon: <Icons.myProfileIcon />,
      },
      {
        title: "Business Profile",
        href: "/business-profile",
        icon: <Icons.businessProfileIcon />,
      },
    ],
  },
  {
    title: "Funding",
    href: "/funding",
    icon: <Icons.funding />,
    children: [
      {
        title: "Funding Opportunities",
        href: "/funding",
        icon: <Icons.fundingIcon />,
      },
      {
        title: "Saved Opportunities",
        href: "/funding-saved-opportunities",
        icon: <Icons.bookMarkIcon />,
      },
      {
        title: "Loan Applications",
        href: "/loan-applications",
        icon: <Icons.moneyBag className={"h-5 w-5"} />,
      },
    ],
  },
  {
    title: "Boost Your Business",
    href: "/boost-your-business",
    icon: <Icons.boostIcon />,
  },
];

// const otherLinks = [
//   // {
//   //   title: "Notifications",
//   //   href: "/notifications",
//   //   icon: <Icons.notifications />,
//   // },
//   // {
//   //   title: "Settings",
//   //   href: "/settings",
//   //   icon: <Icons.settings />,
//   // },
// ];

interface SidenavProps {
  onCloseSidebar?: () => void;
}

const Sidenav = ({ onCloseSidebar }: SidenavProps) => {
  const dispatch = useAppDispatch();
  const { showLogoutModal } = useLogoutModal();
  const [isMobile, setIsMobile] = useState(false);

  // Check if on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const setTitleOnBar = (title: string) => {
    dispatch(setTitle(title));
  };

  const handleCloseSidebar = () => {
    if (isMobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const { completionPercentage } = useCompletionPercentage();

  return (
    <div
      className="flex min-h-svh w-full md:w-[290px] flex-col bg-midnight-blue pb-3 pt-2 text-white shadow-lg"
      style={{
        backgroundImage: `url(/images/branding.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: "rgba(21, 31, 40, 0.95)",
        }}
      />
      <div className="relative flex flex-col flex-1">
        <div className="flex items-center justify-between px-4 pb-4 gradient-border">
          <Image
            src="/images/logo-white.svg"
            alt="Melani Kapital Logo"
            className="w-max max-w-[180px] md:max-w-[200px]"
            width={200}
            height={36}
          />
          <button
            className="text-white p-1 rounded-full hover:bg-white/10 md:hidden"
            onClick={handleCloseSidebar}
          >
            <X size={24} />
          </button>
        </div>
        {completionPercentage !== 100 && (
          <Link
            href={"/onboarding-checklist"}
            className="px-4 cursor-pointer group block"
            onClick={handleCloseSidebar}
          >
            <div className="space-y-2 md:space-y-3 border border-[#E8E9EA80] p-3 md:p-5 rounded-lg mt-4 group-hover:bg-gradient-to-r from-[#8AF2F2] to-[#54DDBB] group-hover:text-midnight-blue">
              <div className="text-white flex justify-between gap-2">
                <h2 className="text-lg md:text-xl font-medium group-hover:text-midnight-blue">
                  My onboarding checklist
                </h2>
                <ChevronRight
                  size={24}
                  className="shrink-0 relative top-1 group-hover:text-midnight-blue"
                />
              </div>
              <p className="text-sm md:text-base">
                Complete all the steps to boost your capital-readiness today!
              </p>
              <div>
                <p className="text-xs md:text-sm font-medium text-right">
                  {completionPercentage}%
                </p>
                <div className="w-full bg-white rounded-sm h-1.5">
                  <div
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                    className="bg-primary-green rounded-sm h-full"
                  />
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="px-4 mt-4">
          <h3 className="py-2 md:py-2.5 text-xs md:text-sm font-medium">
            MENU
          </h3>
          <div className="space-y-1 md:space-y-2">
            {sidenavLinks.map((link) => (
              <SidenavItem
                key={link.title}
                onSetTitle={setTitleOnBar}
                onCloseSidebar={handleCloseSidebar}
                {...link}
              />
            ))}
          </div>
        </div>
        <div className="mt-auto px-4">
          <Button
            variant="ghost"
            onClick={() => {
              showLogoutModal();
              handleCloseSidebar();
            }}
            className="flex w-full cursor-pointer items-center justify-start gap-2 px-4 py-2 md:py-2.5 text-left text-sm md:text-base"
          >
            <Icons.logout className="h-4 w-4 md:h-5 md:w-5" />
            <p>Logout</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SidenavItemProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  children?: Array<{ title: string; href: string; icon: React.ReactElement }>;
  onSetTitle?: (title: string) => void;
  onCloseSidebar?: () => void;
}

const SidenavItem = ({
  title,
  icon: Icon,
  href,
  children,
  onSetTitle,
  onCloseSidebar,
}: SidenavItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = pathname === href;
  const hasChildren = children && children.length > 0;

  const isChildActive = hasChildren
    ? children?.some((child) => pathname === child.href)
    : false;

  useEffect(() => {
    if (isActive && onSetTitle) {
      onSetTitle(title);
    }
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isActive, isChildActive, onSetTitle, title]);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      router.push(href);
      if (onSetTitle) {
        onSetTitle(title);
      }
      if (onCloseSidebar) {
        onCloseSidebar();
      }
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-2 px-3 md:px-4 py-2 md:py-2.5 text-left text-sm md:text-base",
          (isActive || isChildActive) &&
            "bg-gradient-to-r from-[#8AF2F2] to-[#54DDBB] text-midnight-blue",
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5">{Icon}</div>
          <p>{title}</p>
        </div>
        {hasChildren && (
          <div className="ml-auto">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
      </Button>
      {hasChildren && isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {children?.map((child) => (
            <Button
              key={child.title}
              variant="ghost"
              onClick={() => {
                router.push(child.href);
                if (onSetTitle) {
                  onSetTitle(child.title);
                }
                if (onCloseSidebar) {
                  onCloseSidebar();
                }
              }}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-left text-xs md:text-sm",
                pathname === child.href &&
                  "bg-gradient-to-r from-[#8AF2F2] to-[#54DDBB] text-midnight-blue",
              )}
            >
              <div className="h-4 w-4 md:h-5 md:w-5">{child.icon}</div>
              <p>{child.title}</p>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidenav;
