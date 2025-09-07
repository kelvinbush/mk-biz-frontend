import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGetAllLoanProductsQuery } from "@/lib/redux/services/loan-product";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetBusinessProfileByPersonalGuidQuery } from "@/lib/redux/services/user";
import { LoanProduct } from "@/lib/types/loan-product";
import { Icons } from "@/components/icons"; // Constants

// Constants
const LONA_ICONS = [
  <Icons.moneyBag key="money-bag" className={"text-[#00CC99]"} />,
  <Icons.replayIcon key="replay" />,
  <Icons.invoiceIcon key="invoice" />,
  <Icons.moneyBoxIcon key="money-box" />,
  <Icons.vehicleIcon key="vehicle" />,
];

const LoanCard = ({ loanName, description, reference }: LoanProduct) => {
  let icon = LONA_ICONS[0];
  if (loanName === "Business Overdraft") {
    icon = LONA_ICONS[0];
  } else if (loanName === "Business Revolving Credit Plan") {
    icon = LONA_ICONS[1];
  } else if (loanName === "Invoice Financing") {
    icon = LONA_ICONS[2];
  } else if (loanName === "Inventory Financing") {
    icon = LONA_ICONS[3];
  } else if (loanName === "Vehicle & Asset Financing") {
    icon = LONA_ICONS[4];
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="bg-[#E6FAF5] inline-block p-3 md:p-4 rounded-lg mb-3 md:mb-4">
          {icon}
        </div>
        <h3 className="text-lg md:text-xl font-semibold mb-2">{loanName}</h3>
        <p className="text-[#62696F] text-sm md:text-base mb-4 md:mb-6">{description}</p>
        <Link href={`/ecobank-loans/apply?loanId=${reference}`}>
          <Button
            className="w-full flex items-center justify-center gap-2 bg-midnight-blue text-sm md:text-base"
            size="lg"
          >
            Apply Now
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
};

const PartnerLoans = () => {
  const guid = useAppSelector(selectCurrentToken);
  const { data: response } = useGetBusinessProfileByPersonalGuidQuery(
    { guid: guid || "" },
    { skip: !guid },
  );
  const businessGuid = response?.business?.businessGuid;

  const { data: loanProductsResponse } = useGetAllLoanProductsQuery(
    businessGuid as string,
  );

  const loanProducts = loanProductsResponse || [];

  const ecoBankLoans = loanProducts.filter(
    (loan) => loan.partnerName !== "Melanin Kapital",
  );

  return (
    <div className="mx-auto px-3 md:px-4 max-w-7xl">
      <div className="bg-gray-100 p-3 md:p-4 rounded-lg mb-6 md:mb-8">
        <p className="text-base md:text-lg">
          <span className="font-bold">PS: </span>
          <span className="text-primary-green font-medium">Great news! </span>
          You can now expand your funding reach with exclusive opportunities
          from our trusted partners.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {ecoBankLoans.map((loan, index) => (
          <LoanCard key={index} {...loan} />
        ))}
      </div>
    </div>
  );
};

export default PartnerLoans;
