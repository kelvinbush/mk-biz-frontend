"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faMoneyBillTransfer,
  faSackDollar,
} from "@fortawesome/free-solid-svg-icons";
import { Icons } from "@/components/icons";
import { withAuth } from "@/components/auth/RequireAuth";

const benefits = [
  {
    icon: <FontAwesomeIcon icon={faSackDollar} className={"size-8"} />,
    title: "Attractive Loan Limits",
    description:
      "Access loans ranging from $5,000 to $50,000 to meet your business needs.",
  },
  {
    icon: <FontAwesomeIcon icon={faMoneyBillTransfer} className={"size-8"} />,
    title: "Flexible Repayment",
    description:
      "Choose a repayment period that suits your business, of up to 12 months (1 year).",
  },
  {
    title: "Low Interest Rates",
    description:
      "Enjoy competitive interest rates of up to 10% p.a, making repayments affordable.",
    icon: <Icons.interestIcon />,
  },
  {
    icon: <Icons.securityIcon />,
    title: "Security Free",
    description:
      "Enjoy hassle-free access to funds with no collateral required.",
  },
  {
    icon: <Icons.timeIcon />,
    title: "Fast Loan Processing",
    description:
      "Get your loan verified and disbursed within 3 working days for quick access.",
  },
];

const requirements = [
  "Valid Applicant's ID or passport",
  "Valid Applicant's Tax Registration Certificate",
  "Business Registration - your business must be registered with the relevant authorities.",
  "Company Registration Documents",
  "Company Tax Compliance Documents",
  "Company Business Permit / Operating License(s)",
  "Company Financial Details - financial statements for the last 3 years &/or bank statements for the last 1 year",
  "Company Business Plan including Financial Projections",
  "Company Pitch Deck",
  "Company & Shareholders CRB Clearance",
  "Green Business Focus - your business must either be a green business or have a clear plan to use the financing to go green or continue growing green with sustainable practices.",
];

// Loan type definitions
const loanTypes = {
  lpo: {
    title: "LPO Financing",
    description:
      "Access up to €50,000 through our LPO Financing Facility, designed to empower businesses supplying green products or services. This revolving credit line spans up to 9 months, allowing you to access funding against verified Local Purchase Orders with expected payment periods of up to 4 months (30 to 120 days). Once repayment is made, you can access new funds within the credit period—no additional collateral required, as LPO assignment serves as security. Apply today and meet demand confidently while scaling your impact!",
  },
  invoice: {
    title: "Invoice Discount Facility",
    description:
      "Access up to €50,000 through our Invoice Discount Facility, designed to accelerate cash flow for businesses offering green products or services. This revolving credit line runs for up to 9 months, allowing you to borrow against eligible invoices with payment terms of up to 4 months (30 to 120 days). Once an invoice is settled, you can access new funds within the credit period—no additional collateral required, as invoice assignment serves as security. Apply today and unlock the working capital you need to fuel your sustainable growth!",
  },
  term: {
    title: "Term Loan",
    description:
      "Access up to €50,000 in funding with our Term Loan, tailored to support businesses advancing sustainable practices. With a flexible repayment period of up to 12 months and competitive interest rates, this facility is ideal for businesses committed to going green or scaling their existing green operations. Collateral requirements may include personal guarantees or alternative forms of security. Apply today and power your business growth while contributing to a more sustainable future.",
  },
  default: {
    title: "Working Capital Financing",
    description:
      "Access up to €50,000 through our Working Capital Financing solutions, designed to empower businesses supplying green products or services. Our flexible financing options help you meet your business needs while promoting sustainable practices. Apply today and scale your impact!",
  },
};

const Page = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanId = searchParams.get("loanId");
  const [loanInfo, setLoanInfo] = useState(loanTypes.default);

  useEffect(() => {
    // Determine loan type based on loanId
    if (loanId) {
      if (loanId.includes("xbC52NkVJWNk9HvK")) {
        setLoanInfo(loanTypes.lpo);
      } else if (loanId.includes("yaflzGFNppMK5SRb")) {
        setLoanInfo(loanTypes.invoice);
      } else if (loanId.includes("Rq9GeBN4P1TEKk4l")) {
        setLoanInfo(loanTypes.term);
      }
    }
  }, [loanId]);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 288; // w-72 = 18rem = 288px
      const gap = 16; // gap-4 = 1rem = 16px
      scrollRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: "smooth",
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < benefits.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      scrollToIndex(currentIndex + 1);
    }
  };

  const handleApplyNow = () => {
    if (loanId) {
      router.push(`/ecobank-loans/apply?loanId=${loanId}`);
    } else {
      router.push("/ecobank-loans/apply");
    }
  };

  return (
    <div className={"space-y-4"}>
      <Link
        href={"/funding/melaninkapital-loans"}
        className={
          "flex items-center gap-2 hover:underline text-[#62696F] text-sm font-medium"
        }
      >
        <ArrowLeft size={14} />
        Go Back
      </Link>
      <div className="shadow bg-white p-6 rounded">
        <h1 className={"text-primary-green text-3xl font-medium mb-3"}>
          {loanInfo.title}
        </h1>
        <p>
          Access up to <span className="font-bold">€50,000</span>{" "}
          {loanInfo.title === "LPO Financing" && (
            <>
              through our LPO Financing Facility, designed to empower businesses
              supplying green products or services. This revolving credit line
              spans up to <span className="font-bold">9 months</span>, allowing
              you to access funding against verified Local Purchase Orders with
              expected payment periods of up to{" "}
              <span className="font-bold">4 months</span> (30 to 120 days). Once
              repayment is made, you can access new funds within the credit
              period—
              <span className="font-bold">no additional collateral</span>{" "}
              required, as LPO assignment serves as security. Apply today and
              meet demand confidently while scaling your impact!
            </>
          )}
          {loanInfo.title === "Invoice Discount Facility" && (
            <>
              through our Invoice Discount Facility, designed to accelerate cash
              flow for businesses offering green products or services. This
              revolving credit line runs for up to{" "}
              <span className="font-bold">9 months</span>, allowing you to
              borrow against eligible invoices with payment terms of up to{" "}
              <span className="font-bold">4 months</span> (30 to 120 days). Once
              an invoice is settled, you can access new funds within the credit
              period—
              <span className="font-bold">no additional collateral</span>{" "}
              required, as invoice assignment serves as security. Apply today
              and unlock the working capital you need to fuel your sustainable
              growth!
            </>
          )}
          {loanInfo.title === "Term Loan" && (
            <>
              in funding with our Term Loan, tailored to support businesses
              advancing sustainable practices. With a flexible repayment period
              of up to <span className="font-bold">12 months</span> and
              competitive interest rates, this facility is ideal for businesses
              committed to going green or scaling their existing green
              operations. Collateral requirements may include personal
              guarantees or alternative forms of security. Apply today and power
              your business growth while contributing to a more sustainable
              future.
            </>
          )}
          {loanInfo.title === "Working Capital Financing" && (
            <>
              through our Working Capital Financing solutions, designed to
              empower businesses supplying green products or services. Our
              flexible financing options help you meet your business needs while
              promoting sustainable practices. Apply today and scale your
              impact!
            </>
          )}
        </p>
        <h2 className={"text-2xl font-medium mt-8 mb-6"}>
          Why You Should Apply?
        </h2>

        <div className="relative">
          <div className="flex flex-col md:flex-row">
            {/* Benefits Navigation */}
            <div className="bg-[#1C2024] text-white p-6 md:w-32 rounded-l grid place-items-center">
              <h3 className="text-xl ">Benefits</h3>
              <div className="flex md:flex-col gap-2">
                <Button
                  className={`border-white border p-2 rounded transition-colors ${currentIndex === 0 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-700"}`}
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft size={20} />
                </Button>
                <Button
                  className={`border-white border p-2 rounded transition-colors ${currentIndex === benefits.length - 1 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-700"}`}
                  onClick={handleNext}
                  disabled={currentIndex === benefits.length - 1}
                >
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>

            {/* Benefits Cards */}
            <div className="flex-1 overflow-hidden">
              <div
                ref={scrollRef}
                className="flex gap-4 p-4 overflow-x-hidden scroll-smooth"
              >
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex-none w-72 bg-[#E6FAF5] p-6 rounded shadow-md border-[#E8E9EA] "
                  >
                    <div className="text-[#00CC99] mb-4">{benefit.icon}</div>
                    <h4 className="text-sm font-bold mb-2">{benefit.title}</h4>
                    <p className="text-gray-600 text-xs">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div>
          <h2 className={"text-2xl font-medium mt-8 mb-2"}>
            What We Need From You
          </h2>
          <div className="">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center gap-1.5">
                &bull;
                <span className="">{requirement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Now Section */}
        <div className="mt-8 flex justify-center">
          <Button
            className="bg-primary-green hover:bg-primary-green/90 text-white px-6 py-2 rounded flex items-center gap-2"
            onClick={handleApplyNow}
          >
            Apply Now
            <FontAwesomeIcon icon={faArrowRight} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Page);
