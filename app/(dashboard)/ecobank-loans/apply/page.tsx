// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { withAuth } from "@/components/auth/RequireAuth";
import {
  LoanApplicationV2,
  useApplyForLoanV2Mutation,
} from "@/lib/redux/services/loans";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetBusinessProfileByPersonalGuidQuery } from "@/lib/redux/services/user";
import { useGetAllLoanProductsQuery } from "@/lib/redux/services/loan-product";
import { toast } from "sonner";
import { useCompletionPercentage } from "@/hooks/use-completion-percentage";
import { fallbackRates } from "@/lib/types/types";
import { CURRENCY_GROUPS, SupportedCurrency } from "@/lib/types/currency-types";
import {
  EnrichedLoanProduct,
  ExchangeRates,
  LoanCalculation,
  LoanQuotationResponse,
} from "@/lib/types/loan-types";
import SuccessModal from "@/components/modals/success-modal";
import FailureModal from "@/components/modals/failure-modal";

const SUPPORT_EMAIL = "support@melaninkapital.com";

type TenureUnit = "months" | "years";

const Page = () => {
  const [loanId, setLoanId] = useState<string | null>(null);

  // Get loanId from URL query parameters
  useEffect(() => {
    if (window) {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("loanId");
        const defaultId = "Rq9GeBN4P1TEKk4l"; // Default loan ID for testing
        setLoanId(id || defaultId);
      }
    }
  }, []);
  const [mutation] = useApplyForLoanV2Mutation();
  const guid = useAppSelector(selectCurrentToken);
  const { data: response } = useGetBusinessProfileByPersonalGuidQuery(
    { guid: guid || "" },
    { skip: !guid },
  );
  const businessGuid = response?.business?.businessGuid;

  const { data: loanProducts } = useGetAllLoanProductsQuery(
    businessGuid as string,
    { skip: !businessGuid },
  );

  const [enrichedLoanProducts, setEnrichedLoanProducts] = useState<
    EnrichedLoanProduct[]
  >([]);
  const [, setIsLoadingEnrichedProducts] = useState(false);

  // Add exchange rate state variables
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [selectedCurrency, setSelectedCurrency] =
    useState<SupportedCurrency>("KES");

  // Define min and max amount constants - these will be overridden by product values when available
  const DEFAULT_MIN_AMOUNT = 5000;
  const DEFAULT_MAX_AMOUNT = 50000;

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/2a4a91b34377b75f3f14375e/latest/EUR`,
        );
        const data = await response.json();
        if (data.result === "success") {
          setExchangeRates(data.conversion_rates);
        } else {
          setExchangeRates(fallbackRates);
        }
      } catch (error) {
        setExchangeRates(fallbackRates);
        toast.error(
          "Failed to fetch current exchange rates. Using fallback rates.",
        );
        console.error("Failed to fetch exchange rates:", error);
      }
    };

    fetchExchangeRates();
    // Fetch rates every hour
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Utility function to convert amounts between currencies
  const convertAmount = (
    value: number,
    from: SupportedCurrency,
    to: SupportedCurrency,
  ): number => {
    if (!exchangeRates[from] || !exchangeRates[to]) return value;
    return (value / exchangeRates[from]) * exchangeRates[to];
  };

  // Fetch enriched loan products from our internal API
  useEffect(() => {
    if (businessGuid) {
      setIsLoadingEnrichedProducts(true);
      fetch("/api/loan-products")
        .then((response) => response.json())
        .then((data) => {
          setEnrichedLoanProducts(data || []);
        })
        .catch((error) => {
          console.error("Error fetching enriched loan products:", error);
          setEnrichedLoanProducts([]);
        })
        .finally(() => {
          setIsLoadingEnrichedProducts(false);
        });
    }
  }, [businessGuid]);

  // Find selected loan product from enriched data
  const selectedEnrichedLoanProduct = useMemo(() => {
    if (!enrichedLoanProducts.length || !loanId) {
      return null;
    }
    return enrichedLoanProducts.find((product) => product.refId === loanId);
  }, [enrichedLoanProducts, loanId]);

  const selectedLoanProduct = useMemo(() => {
    // First try to find the loan product in the enriched data
    if (selectedEnrichedLoanProduct) {
      // Map enriched loan product to the format expected by the form
      return {
        id: selectedEnrichedLoanProduct.refId,
        reference: selectedEnrichedLoanProduct.refId,
        loanName: selectedEnrichedLoanProduct.name,
        loanPriceMax: selectedEnrichedLoanProduct.maxAmount || 50000,
        loanPriceMin: selectedEnrichedLoanProduct.minAmount || 5000,
        loanInterest:
          typeof selectedEnrichedLoanProduct.interestRate === "number"
            ? selectedEnrichedLoanProduct.interestRate
            : parseFloat(
                String(selectedEnrichedLoanProduct.interestRate).replace(
                  /[^0-9.]/g,
                  "",
                ),
              ) || 10,
        interestPeriod: selectedEnrichedLoanProduct.interestPeriod || "monthly",
        minTerm: selectedEnrichedLoanProduct.minTerm || 1,
        maxTerm: selectedEnrichedLoanProduct.maxTerm || 12,
        termPeriod: selectedEnrichedLoanProduct.termPeriod || "months",
      };
    }

    // Fallback to the original loan products from Redux
    if (!loanProducts || !loanId) {
      return null;
    }

    const product = loanProducts.find(
      (product) => product.reference === loanId,
    );
    return product;
  }, [selectedEnrichedLoanProduct, loanProducts, loanId]);
  const { completionPercentage } = useCompletionPercentage();
  const [amount, setAmount] = useState<string>("5000.00");

  // Log selected loan product when it changes
  useEffect(() => {
    if (selectedLoanProduct) {
      // Log the selected loan product details for debugging
    }
  }, [selectedLoanProduct]);

  const [period, setPeriod] = useState<string>("3");
  const [purpose, setPurpose] = useState<string>("");

  // Update amount when loan product changes to ensure it's within min/max range
  useEffect(() => {
    if (selectedLoanProduct) {
      // Only validate if amount has a value (allow clearing the field)
      if (amount !== "") {
        const currentAmount = parseFloat(amount);
        if (isNaN(currentAmount)) {
          // Don't reset for NaN to allow clearing the field
        } else if (currentAmount > selectedLoanProduct.loanPriceMax) {
          setAmount(selectedLoanProduct.loanPriceMax.toString());
        } else if (currentAmount < selectedLoanProduct.loanPriceMin) {
          setAmount(selectedLoanProduct.loanPriceMin.toString());
        }
      }

      // Only validate if period has a value (allow clearing the field)
      if (period !== "") {
        const currentPeriod = parseInt(period);
        if (isNaN(currentPeriod)) {
          // Don't reset for NaN to allow clearing the field
        } else if (currentPeriod > selectedLoanProduct.maxTerm) {
          setPeriod(selectedLoanProduct.maxTerm.toString());
        } else if (currentPeriod < selectedLoanProduct.minTerm) {
          setPeriod(selectedLoanProduct.minTerm.toString());
        }
      }
    }
  }, [selectedLoanProduct]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errors, setErrors] = useState({
    amount: "",
    period: "",
    purpose: "",
  });
  const [calculation, setCalculation] = useState<LoanCalculation>({
    totalLoan: 0,
    takeHome: 0,
    totalPayableInterest: 0,
    monthlyInstallments: 0,
  });

  const [tenureUnit] = useState<TenureUnit>("months");

  const [, setLoanQuotation] = useState<LoanQuotationResponse | null>(null);
  const [isLoadingQuotation, setIsLoadingQuotation] = useState(false);
  const [hasQuotation, setHasQuotation] = useState(false);

  useEffect(() => {
    const newErrors = {
      amount: "",
      period: "",
      purpose: "",
    };

    // Only validate amount if it's not empty
    if (amount) {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum)) {
        newErrors.amount = "Please enter a valid number";
      } else if (selectedLoanProduct) {
        if (amountNum > selectedLoanProduct.loanPriceMax) {
          newErrors.amount = `Maximum amount is ${selectedCurrency} ${selectedLoanProduct.loanPriceMax.toLocaleString()}`;
        } else if (amountNum < selectedLoanProduct.loanPriceMin) {
          newErrors.amount = `Minimum amount is ${selectedCurrency} ${selectedLoanProduct.loanPriceMin.toLocaleString()}`;
        }
      }
    }

    // Only validate period if it's not empty
    if (period) {
      const periodNum = parseInt(period);
      const termPeriod = selectedLoanProduct?.termPeriod || tenureUnit;

      if (isNaN(periodNum)) {
        newErrors.period = "Please enter a valid number";
      } else if (selectedLoanProduct) {
        if (periodNum > selectedLoanProduct.maxTerm) {
          newErrors.period = `Maximum ${termPeriod} is ${selectedLoanProduct.maxTerm}`;
        } else if (periodNum < selectedLoanProduct.minTerm) {
          newErrors.period = `Minimum ${termPeriod} is ${selectedLoanProduct.minTerm}`;
        }
      }
    }

    if (!purpose) {
      newErrors.purpose = "Purpose is required";
    }

    setErrors(newErrors);
  }, [
    amount,
    period,
    purpose,
    selectedLoanProduct,
    selectedCurrency,
    tenureUnit,
  ]);

  // Format a number with commas for display
  const formatNumberWithCommas = (value: string | number): string => {
    if (!value && value !== 0) return "";

    // Convert to number and fix to 2 decimal places
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    const fixedValue = numValue.toFixed(2);

    // Split the number at the decimal point
    const parts = fixedValue.split(".");

    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Rejoin with decimal part
    return parts.join(".");
  };

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    setSelectedCurrency(currency);
  };

  const handleSliderChange = (value: number[]) => {
    const newAmount = value[0].toFixed(2);
    setAmount(newAmount);
  };

  const handlePeriodChange = (value: string) => {
    // If the value is empty or just contains non-numeric characters, clear the period
    if (!value || value.replace(/[^0-9]/g, "").length === 0) {
      setPeriod("");
      return;
    }

    // Extract only the numeric value
    const numericValue = value.replace(/[^0-9]/g, "");
    setPeriod(numericValue);
  };

  const handleMonthsSliderChange = (value: number[]) => {
    const newPeriod = value[0].toString();
    setPeriod(newPeriod);
    // Clear any period errors since slider values are always valid
    setErrors((prev) => ({ ...prev, period: "" }));
  };

  const getPeriodInMonths = () =>
    tenureUnit === "years" ? parseInt(period) * 12 : parseInt(period);

  const handleSubmit = async () => {
    if (completionPercentage < 10) {
      setFailed(true);
      return;
    }

    // Validate amount against max loan amount one more time before submission
    if (
      selectedLoanProduct &&
      parseFloat(amount) > selectedLoanProduct.loanPriceMax
    ) {
      setErrors((prev) => ({
        ...prev,
        amount: `Maximum amount is ${selectedCurrency} ${selectedLoanProduct.loanPriceMax.toLocaleString()}`,
      }));
      return;
    }

    // Create the new payload format for LoanApplicationV2
    const loanApplication: LoanApplicationV2 = {
      loanProductReference: loanId || "", // Using the reference string directly
      loanAmount: parseFloat(amount),
      repaymentPeriod: Number(getPeriodInMonths()),
      loanPurpose: purpose,
      businessGuid: response?.business?.businessGuid || "",
    };

    toast.promise(mutation(loanApplication).unwrap(), {
      loading: "Applying for loan...",
      success: () => {
        setShowSuccessModal(true);
        return "Your loan application has been submitted successfully";
      },
      error: "Failed to save loan application",
    });
  };

  const calculateLoan = async () => {
    const principal = parseFloat(amount) || 0;
    const months = getPeriodInMonths() || 1;

    // Check if we have the necessary data to fetch a quotation
    if (
      !loanId ||
      !response?.business?.prestaRef ||
      principal <= 0 ||
      months <= 0
    ) {
      fallbackCalculation(principal, months);
      toast.error(
        "Unable to fetch loan quotation. Using estimated calculations instead.",
      );
      return;
    }

    try {
      setIsLoadingQuotation(true);

      // Call the loan quotation API
      const quotationResponse = await fetch("/api/loan-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerRefId: "cQ9a0mJduCNgJsYf", // Use the customer ID that works with the curl command
          loanProductRefId: loanId,
          amount: principal.toString(),
          period: months.toString(),
          periodUnits:
            selectedLoanProduct?.interestPeriod === "YEARLY"
              ? "YEARS"
              : "MONTHS",
        }),
      });

      if (!quotationResponse.ok) {
        fallbackCalculation(principal, months);
        toast.error(
          "Failed to fetch loan quotation. Using estimated calculations instead.",
        );
        return;
      }

      const quotationData: LoanQuotationResponse =
        await quotationResponse.json();

      setLoanQuotation(quotationData);
      setHasQuotation(true);

      // Update calculation based on quotation data
      setCalculation({
        totalLoan: quotationData.totalAmount,
        takeHome: quotationData.disbursementAmount,
        totalPayableInterest: quotationData.interestAmount,
        monthlyInstallments: quotationData.monthlyInstallment,
      });

      toast.success("Loan quotation fetched successfully!");
    } catch (error) {
      fallbackCalculation(principal, months);
      toast.error(
        "Error fetching loan quotation. Using estimated calculations instead.",
      );
      console.error("Error fetching loan quotation:", error);
    } finally {
      setIsLoadingQuotation(false);
    }
  };

  // Fallback calculation method using the original calculation logic
  const fallbackCalculation = (principal: number, months: number) => {
    const interestRate = selectedLoanProduct?.loanInterest || 10;
    const interestPeriod = selectedLoanProduct?.interestPeriod || "per annum";

    // Only calculate if we have a valid interest rate
    if (interestRate) {
      // Convert interest rate based on period
      const annualInterestRate = interestRate / 100;
      let monthlyInterestRate;

      // Adjust interest rate based on period
      if (interestPeriod === "monthly" || interestPeriod === "per month") {
        monthlyInterestRate = annualInterestRate;
      } else if (interestPeriod === "weekly" || interestPeriod === "per week") {
        monthlyInterestRate = annualInterestRate * 4; // Approximate weeks per month
      } else if (interestPeriod === "daily" || interestPeriod === "per day") {
        monthlyInterestRate = annualInterestRate * 30; // Approximate days per month
      } else {
        // Default to annual (per annum)
        monthlyInterestRate = annualInterestRate / 12;
      }

      // Calculate monthly payment using the standard amortization formula:
      // M = P * [r(1+r)^n] / [(1+r)^n - 1]
      // Where:
      // M = monthly payment
      // P = principal (loan amount)
      // r = monthly interest rate (annual rate / 12)
      // n = total number of payments (months)

      let monthlyPayment;
      if (monthlyInterestRate === 0) {
        // If interest rate is 0, simple division
        monthlyPayment = principal / months;
      } else {
        // Standard amortization formula
        monthlyPayment =
          (principal *
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months))) /
          (Math.pow(1 + monthlyInterestRate, months) - 1);
      }

      // Calculate total payments over the life of the loan
      const totalPayments = monthlyPayment * months;

      // Calculate total interest paid
      const totalInterest = totalPayments - principal;

      setCalculation({
        totalLoan: principal + totalInterest, // Include interest in total loan amount
        takeHome: principal,
        totalPayableInterest: totalInterest,
        monthlyInstallments: monthlyPayment,
      });

      setHasQuotation(false);
    } else {
      setCalculation({
        totalLoan: principal, // No interest to add in this case
        takeHome: principal,
        totalPayableInterest: 0,
        monthlyInstallments: principal / months,
      });

      setHasQuotation(false);
    }
  };

  // Initialize calculation with empty values - no automatic calculation
  useEffect(() => {
    // Only set initial empty values when the component first loads
    if (!calculation.totalLoan && !calculation.monthlyInstallments) {
      setCalculation({
        totalLoan: 0,
        takeHome: 0,
        totalPayableInterest: 0,
        monthlyInstallments: 0,
      });
    }

    // Reset quotation status when inputs change
    if (hasQuotation) {
      setHasQuotation(false);
    }
  }, [
    amount,
    period,
    tenureUnit,
    selectedLoanProduct,
    hasQuotation,
    calculation.totalLoan,
    calculation.monthlyInstallments,
  ]);

  // Add a default prestaRef if missing from the business profile
  useEffect(() => {
    if (response?.response && !response.response.prestaRef) {
      Object.defineProperty(response.response, "prestaRef", {
        value: "6dFlC2AOVRfy0jRT",
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  }, [response]);

  return (
    <>
      <div className="space-y-4 px-4 sm:px-6 md:px-8">
        <div className={"flex items-center gap-2"}>
          <Link
            href={`/funding/melaninkapital-loans`}
            className="flex text-primary-green items-center gap-2 hover:underline text-sm font-medium transition-colors"
          >
            <ArrowLeft size={14} />
            Go Back
          </Link>
          <span className="text-midnight-blue">&middot;</span>
          <span className="text-[#93989C]">
            {selectedLoanProduct?.loanName}
          </span>
        </div>
        <div className="shadow-md bg-white p-4 sm:p-6 rounded-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A]">
                Loan application details
              </h1>
            </div>
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-base sm:text-lg font-bold hover:bg-gray-100 transition-colors"
              title="Contact Support"
              onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}
            >
              Need Help
              <HelpCircle className="h-5 w-5 ml-1" />
            </Button>
          </div>
          <p className="text-xl sm:text-2xl mb-6 sm:mb-8 text-gray-700">
            Fill in your loan requirements below to get started with your
            application
          </p>

          {/* Application Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Form */}
            <div className="space-y-8 p-4 sm:p-6 rounded-lg">
              <div className="space-y-4">
                <Label
                  htmlFor="loan-amount"
                  className="text-base font-medium flex items-center gap-1"
                >
                  How much funding do you need?{" "}
                  <span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px] text-sm">
                          Enter the amount you need in EUR. The minimum is €
                          {selectedLoanProduct?.loanPriceMin ||
                            DEFAULT_MIN_AMOUNT}{" "}
                          and maximum is €
                          {selectedLoanProduct?.loanPriceMax ||
                            DEFAULT_MAX_AMOUNT}
                          .
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="relative flex-1 w-full">
                    <Input
                      id="loan-amount"
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`${errors.amount ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"} transition-all pl-8`}
                      aria-describedby={
                        errors.amount ? "amount-error" : undefined
                      }
                      placeholder="Enter amount"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                      €
                    </div>
                  </div>
                  <div className="text-center hidden sm:flex items-center text-gray-500">
                    =
                  </div>
                  <div className="relative flex-1 w-full">
                    <Input
                      type="text"
                      value={formatNumberWithCommas(
                        convertAmount(
                          parseFloat(amount) || 0,
                          "EUR",
                          selectedCurrency,
                        ),
                      )}
                      readOnly
                      className="bg-gray-100 text-gray-700 pl-12"
                    />
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                      {selectedCurrency}
                    </div>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <select
                      className="bg-white border-gray-300 h-10 rounded-md border border-input px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={selectedCurrency}
                      onChange={(e) =>
                        handleCurrencyChange(
                          e.target.value as SupportedCurrency,
                        )
                      }
                      aria-label="Select currency"
                    >
                      {/* Group currencies by region */}
                      <optgroup label="Primary Currencies">
                        {CURRENCY_GROUPS.primaryCurrencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Major World Currencies">
                        {CURRENCY_GROUPS.majorWorldCurrencies.map(
                          (currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ),
                        )}
                      </optgroup>
                      <optgroup label="African Currencies">
                        {CURRENCY_GROUPS.africanCurrencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Middle Eastern Currencies">
                        {CURRENCY_GROUPS.middleEasternCurrencies.map(
                          (currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ),
                        )}
                      </optgroup>
                      <optgroup label="Asian Currencies">
                        {CURRENCY_GROUPS.asianCurrencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Other Major Currencies">
                        {CURRENCY_GROUPS.otherMajorCurrencies.map(
                          (currency) => (
                            <option key={currency} value={currency}>
                              {currency}
                            </option>
                          ),
                        )}
                      </optgroup>
                    </select>
                  </div>
                </div>
                <div className="mt-2">
                  <Slider
                    defaultValue={[5000]}
                    max={
                      selectedLoanProduct?.loanPriceMax || DEFAULT_MAX_AMOUNT
                    }
                    min={
                      selectedLoanProduct?.loanPriceMin || DEFAULT_MIN_AMOUNT
                    }
                    step={100}
                    value={[
                      parseFloat(amount) ||
                        selectedLoanProduct?.loanPriceMin ||
                        DEFAULT_MIN_AMOUNT,
                    ]}
                    onValueChange={handleSliderChange}
                    className="my-4"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      €
                      {(
                        selectedLoanProduct?.loanPriceMin || DEFAULT_MIN_AMOUNT
                      ).toLocaleString()}
                    </span>
                    <span>
                      €
                      {(
                        selectedLoanProduct?.loanPriceMax || DEFAULT_MAX_AMOUNT
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                {errors.amount && (
                  <p
                    id="amount-error"
                    className="text-sm text-red-500 flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-alert-circle"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-200">
                <Label
                  htmlFor="repayment-period"
                  className="text-base font-medium flex items-center gap-1"
                >
                  What&apos;s your preferred repayment duration?{" "}
                  <span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px] text-sm">
                          Select how long you need to repay the loan. Shorter
                          periods may have different interest rates.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-auto flex-1">
                    <Input
                      id="repayment-period"
                      type="text"
                      value={period}
                      onChange={(e) => handlePeriodChange(e.target.value)}
                      className={`${errors.period ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"} transition-all w-full`}
                      aria-describedby={
                        errors.period ? "period-error" : undefined
                      }
                      placeholder="Enter period"
                    />
                  </div>
                  <span className="bg-white border-gray-300 h-10 rounded-md border border-input px-3 py-2 text-sm min-w-[120px] flex items-center justify-center w-full sm:w-auto">
                    {selectedLoanProduct?.termPeriod || tenureUnit}
                  </span>
                </div>
                <div className="mt-2">
                  <Slider
                    defaultValue={[3]}
                    max={
                      selectedLoanProduct?.maxTerm ||
                      (tenureUnit === "months" ? 12 : 1)
                    }
                    min={selectedLoanProduct?.minTerm || 1}
                    value={[
                      parseInt(period) || selectedLoanProduct?.minTerm || 1,
                    ]}
                    onValueChange={handleMonthsSliderChange}
                    className="my-4"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      {selectedLoanProduct?.minTerm || 1}{" "}
                      {selectedLoanProduct?.termPeriod || tenureUnit}
                    </span>
                    <span>
                      {Math.floor(
                        (selectedLoanProduct?.minTerm || 1) +
                          (selectedLoanProduct?.maxTerm || 12),
                      ) / 2}{" "}
                      {selectedLoanProduct?.termPeriod || tenureUnit}
                    </span>
                    <span>
                      {selectedLoanProduct?.maxTerm || 12}{" "}
                      {selectedLoanProduct?.termPeriod || tenureUnit}
                    </span>
                  </div>
                </div>
                {errors.period && (
                  <p
                    id="period-error"
                    className="text-sm text-red-500 flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-alert-circle"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {errors.period}
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-200">
                <Label
                  htmlFor="loan-purpose"
                  className="text-base font-medium flex items-center gap-1"
                >
                  How do you plan to use the funds?{" "}
                  <span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px] text-sm">
                          Provide a clear description of how you&apos;ll use the
                          loan. This helps with approval.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Textarea
                  id="loan-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={`${errors.purpose ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"} transition-all resize-none`}
                  placeholder="Briefly describe your intended use of the funds (e.g., inventory purchase, equipment upgrade, hiring staff)"
                  rows={3}
                  aria-describedby={
                    errors.purpose ? "purpose-error" : undefined
                  }
                />
                <div className="flex justify-between items-center">
                  <div>
                    {errors.purpose && (
                      <p
                        id="purpose-error"
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-alert-circle"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {errors.purpose}
                      </p>
                    )}
                  </div>
                  <div
                    className={`text-right text-sm ${purpose.length > 90 ? "text-amber-600 font-medium" : "text-gray-500"}`}
                  >
                    {purpose.length}/100
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-200">
                <Label
                  htmlFor="interest-rate"
                  className="text-base font-medium flex items-center gap-1"
                >
                  Interest rate <span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px] text-sm">
                          This is the interest rate for this loan product (
                          {selectedLoanProduct?.interestPeriod || "per annum"}).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div>
                  <div className="relative">
                    <Input
                      id="interest-rate"
                      type="text"
                      value={selectedLoanProduct?.loanInterest || 10}
                      readOnly
                      className="pl-24 pr-10 bg-gray-100 text-gray-700 text-right text-lg"
                    />
                    <div className="absolute left-3 top-2.5 uppercase text-gray-600 font-medium">
                      {selectedLoanProduct?.interestPeriod || "per annum"}
                    </div>
                    <div className="absolute right-3 top-[6px] text-lg">%</div>
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="ecobankConsent"
                      className="mt-1"
                      onChange={(e) => {
                        console.log("Ecobank consent:", e.target.checked);
                      }}
                    />
                    <label
                      htmlFor="ecobankConsent"
                      className="text-sm text-gray-700"
                    >
                      Through our partnership with Ecobank, you can now access
                      additional funding options. By checking this box, you
                      confirm interest in Ecobank loans and we&apos;ll share
                      your details with their team to explore loan options.
                    </label>
                  </div>
                </div>
              </div>

              {/* Mobile Submit Button - Only visible on small screens */}
              <div className="block lg:hidden mt-6">
                <Button
                  className="w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white py-6 transition-colors"
                  onClick={handleSubmit}
                  size={"lg"}
                  disabled={
                    !!errors.amount || !!errors.period || !!errors.purpose
                  }
                >
                  Submit Application
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
                {(!!errors.amount || !!errors.period || !!errors.purpose) && (
                  <p className="text-center text-sm text-red-500 mt-2">
                    Please fix the errors above before submitting
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Loan Summary */}
            <div className="space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Loan Summary</h3>

                <div className="space-y-3">
                  {/* Total Loan Amount - Added as per design */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-center text-gray-700 uppercase text-sm font-medium">
                      TOTAL LOAN AMOUNT
                    </p>
                    <p className="text-center text-3xl font-bold mt-2">
                      € {formatNumberWithCommas(calculation.totalLoan)}
                    </p>
                    <p className="text-center text-sm font-medium text-gray-500">
                      ({selectedCurrency}{" "}
                      {formatNumberWithCommas(
                        convertAmount(
                          calculation.totalLoan,
                          "EUR",
                          selectedCurrency,
                        ),
                      )}
                      )
                    </p>
                  </div>

                  <div className="flex justify-between py-3 border-b">
                    <p className="text-gray-700">Your Take Home</p>
                    <div>
                      <p className="font-medium text-right">
                        € {formatNumberWithCommas(calculation.takeHome)}
                      </p>
                      <p
                        className={
                          "text-sm font-medium text-gray-500 text-right"
                        }
                      >
                        ({selectedCurrency}{" "}
                        {formatNumberWithCommas(
                          convertAmount(
                            calculation.takeHome,
                            "EUR",
                            selectedCurrency,
                          ),
                        )}
                        )
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between py-3 border-b">
                    <p className="text-gray-700">Total Payable Interest</p>
                    <div>
                      <p className="font-medium text-right">
                        €{" "}
                        {formatNumberWithCommas(
                          calculation.totalPayableInterest,
                        )}
                      </p>
                      <p
                        className={
                          "text-sm font-medium text-gray-500 text-right"
                        }
                      >
                        ({selectedCurrency}{" "}
                        {formatNumberWithCommas(
                          convertAmount(
                            calculation.totalPayableInterest,
                            "EUR",
                            selectedCurrency,
                          ),
                        )}
                        )
                      </p>
                    </div>
                  </div>

                  {/* Hide monthly installments for specific loan IDs */}
                  {loanId !== "yaflzGFNppMK5SRb" &&
                    loanId !== "xbC52NkVJWNk9HvK" && (
                      <div className="flex justify-between py-3 border-b">
                        <p className="text-gray-700">Monthly Installments</p>
                        <div>
                          <p className="font-medium text-right">
                            €{" "}
                            {formatNumberWithCommas(
                              calculation.monthlyInstallments,
                            )}
                          </p>
                          <p
                            className={
                              "text-sm font-medium text-gray-500 text-right"
                            }
                          >
                            ({selectedCurrency}{" "}
                            {formatNumberWithCommas(
                              convertAmount(
                                calculation.monthlyInstallments,
                                "EUR",
                                selectedCurrency,
                              ),
                            )}
                            )
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                {/* Loan details summary */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                  <h3 className="font-medium text-gray-700">Loan Details</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Product:</span>
                    <span className="font-medium">
                      {selectedLoanProduct?.loanName || "Standard Loan"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-medium">
                      {selectedLoanProduct?.loanInterest || 10}%{" "}
                      {selectedLoanProduct?.interestPeriod || "per annum"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repayment Period:</span>
                    <span className="font-medium">
                      {period} {selectedLoanProduct?.termPeriod || tenureUnit}
                    </span>
                  </div>
                </div>

                {/* Desktop Submit Button - Only visible on large screens */}
                <div className="hidden lg:block mt-auto pt-6">
                  {/* Calculate Interest Button */}
                  <div className="mb-6">
                    <Button
                      onClick={calculateLoan}
                      disabled={isLoadingQuotation}
                      className="w-full flex items-center justify-center gap-2"
                      variant={hasQuotation ? "outline" : "outline"}
                    >
                      {isLoadingQuotation ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Calculating...
                        </>
                      ) : hasQuotation ? (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Recalculate Interest
                        </>
                      ) : (
                        <>Calculate Interest</>
                      )}
                    </Button>
                  </div>
                  <Button
                    className={`w-full flex items-center justify-center gap-2 text-white py-6 transition-all ${!!errors.amount || !!errors.period || !!errors.purpose ? "bg-gray-400 cursor-not-allowed" : "bg-[#0F172A] hover:bg-[#1E293B]"}`}
                    onClick={handleSubmit}
                    size={"lg"}
                    disabled={
                      !!errors.amount || !!errors.period || !!errors.purpose
                    }
                  >
                    Submit Application
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                  {(!!errors.amount || !!errors.period || !!errors.purpose) && (
                    <p className="text-center text-sm text-red-500 mt-2">
                      Please fix the errors above before submitting
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Failure Modal */}
      {failed && (
        <FailureModal
          isOpen={failed}
          onClose={() => setFailed(false)}
          completionPercentage={completionPercentage}
        />
      )}
    </>
  );
};

export default withAuth(Page);
