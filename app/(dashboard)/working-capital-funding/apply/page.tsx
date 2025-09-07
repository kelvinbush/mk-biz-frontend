"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { withAuth } from "@/components/auth/RequireAuth";
import {
  LoanApplicationV2,
  useApplyForLoanV2Mutation,
} from "@/lib/redux/services/loans";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectCurrentToken } from "@/lib/redux/features/authSlice";
import { useGetBusinessProfileByPersonalGuidQuery } from "@/lib/redux/services/user";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCompletionPercentage } from "@/hooks/use-completion-percentage";
import { fallbackRates } from "@/lib/types/types";

interface LoanCalculation {
  totalLoan: number;
  takeHome: number;
  totalPayableInterest: number;
  monthlyInstallments: number;
}

const SUPPORT_EMAIL = "support@melaninkapital.com";

interface ExchangeRates {
  [key: string]: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SUPPORTED_CURRENCIES = [
  // Primary currencies
  "USD",
  "KES",
  "EUR",
  "GBP", // Major world currencies
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "CNY",
  "HKD",
  "SGD", // African currencies
  "NGN",
  "ZAR",
  "GHS",
  "UGX",
  "TZS",
  "RWF",
  "EGP",
  "MAD", // Middle Eastern currencies
  "AED",
  "SAR",
  "QAR",
  "BHD",
  "KWD",
  "OMR", // Asian currencies
  "INR",
  "PKR",
  "BDT",
  "IDR",
  "MYR",
  "THB",
  "KRW",
  "VND", // Other major currencies
  "BRL",
  "MXN",
  "RUB",
  "TRY",
  "NZD",
] as const;
type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

// Currency names mapping
const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  // Primary currencies
  USD: "US Dollar",
  KES: "Kenyan Shilling",
  EUR: "Euro",
  GBP: "British Pound", // Major world currencies
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  HKD: "Hong Kong Dollar",
  SGD: "Singapore Dollar", // African currencies
  NGN: "Nigerian Naira",
  ZAR: "South African Rand",
  GHS: "Ghanaian Cedi",
  UGX: "Ugandan Shilling",
  TZS: "Tanzanian Shilling",
  RWF: "Rwandan Franc",
  EGP: "Egyptian Pound",
  MAD: "Moroccan Dirham", // Middle Eastern currencies
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  QAR: "Qatari Riyal",
  BHD: "Bahraini Dinar",
  KWD: "Kuwaiti Dinar",
  OMR: "Omani Rial", // Asian currencies
  INR: "Indian Rupee",
  PKR: "Pakistani Rupee",
  BDT: "Bangladeshi Taka",
  IDR: "Indonesian Rupiah",
  MYR: "Malaysian Ringgit",
  THB: "Thai Baht",
  KRW: "South Korean Won",
  VND: "Vietnamese Dong", // Other major currencies
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  RUB: "Russian Ruble",
  TRY: "Turkish Lira",
  NZD: "New Zealand Dollar",
};

const Page = () => {
  const [mutation] = useApplyForLoanV2Mutation();
  const guid = useAppSelector(selectCurrentToken);
  const { data: response } = useGetBusinessProfileByPersonalGuidQuery(
    { guid: guid || "" },
    { skip: !guid },
  );
  const { completionPercentage } = useCompletionPercentage();
  const [amount, setAmount] = useState<string>("5000.00");
  const [period, setPeriod] = useState<string>("3");
  const [purpose, setPurpose] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ecobankSubscription, setEcobankSubscription] = useState(false);
  const [selectedCurrency, setSelectedCurrency] =
    useState<SupportedCurrency>("KES");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
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

  const INTEREST_RATE = 10; // 10% per annum
  const MIN_AMOUNT = 5000;
  const MAX_AMOUNT = 50000;

  // Validate form fields in real-time
  useEffect(() => {
    const newErrors = {
      amount: "",
      period: "",
      purpose: "",
    };

    const amountNum = parseFloat(amount);
    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(amountNum)) {
      newErrors.amount = "Please enter a valid number";
    } else if (amountNum < MIN_AMOUNT) {
      newErrors.amount = `Minimum amount is $${MIN_AMOUNT}`;
    } else if (amountNum > MAX_AMOUNT) {
      newErrors.amount = `Maximum amount is $${MAX_AMOUNT}`;
    }

    const periodNum = parseInt(period);
    if (!period) {
      newErrors.period = "Period is required";
    } else if (isNaN(periodNum)) {
      newErrors.period = "Please enter a valid number";
    } else if (periodNum < 1) {
      newErrors.period = "Minimum period is 1 month";
    } else if (periodNum > 12) {
      newErrors.period = "Maximum period is 12 months";
    }

    if (!purpose.trim()) {
      newErrors.purpose = "Purpose is required";
    } else if (purpose.length < 10) {
      newErrors.purpose = "Please provide more detail about the purpose";
    }

    setErrors(newErrors);
  }, [amount, period, purpose]);

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
          console.error("Failed to fetch exchange rates:", data);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        toast.error(
          "Failed to fetch current exchange rates. Using fallback rates.",
        );
        setExchangeRates(fallbackRates);
      }
    };

    fetchExchangeRates();
    // Fetch rates every hour
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const convertAmount = (
    value: number,
    from: SupportedCurrency,
    to: SupportedCurrency,
  ): number => {
    if (!exchangeRates[from] || !exchangeRates[to]) return value;
    return (value / exchangeRates[from]) * exchangeRates[to];
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    setAmount(numericValue);
  };

  const handleCurrencyChange = (currency: SupportedCurrency) => {
    setSelectedCurrency(currency);
  };

  const handleSliderChange = (value: number[]) => {
    const newAmount = value[0].toFixed(2);
    setAmount(newAmount);
  };

  const handleMonthsSliderChange = (value: number[]) => {
    const newPeriod = value[0].toString();
    setPeriod(newPeriod);
    // Clear any period errors since slider values are always valid
    setErrors((prev) => ({ ...prev, period: "" }));
  };

  const handlePeriodChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setPeriod(numericValue);

    // Validate that period is not greater than 12 months
    if (parseInt(numericValue) > 12) {
      setErrors((prev) => ({
        ...prev,
        period: "Maximum repayment period is 12 months",
      }));
    } else {
      setErrors((prev) => ({ ...prev, period: "" }));
    }
  };

  const handleSubmit = async () => {
    if (completionPercentage < 80) {
      setFailed(true);
      return;
    }

    const loanApplication: LoanApplicationV2 = {
      loanProductReference: "8786731b-1fb2-410d-b973-d7730f717121", // Ensure it's a number type
      loanAmount: parseFloat(amount),
      repaymentPeriod: `${period} months`,
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

  const calculateLoan = (loanAmount: string, loanPeriod: string) => {
    const principal = parseFloat(loanAmount) || 0;
    const months = parseInt(loanPeriod) || 1;

    // Calculate interest for the period
    const annualInterestRate = INTEREST_RATE / 100;
    const totalInterest = principal * annualInterestRate * (months / 12);

    // Calculate monthly installment using loan amortization formula
    const monthlyPayment = (principal + totalInterest) / months;

    setCalculation({
      totalLoan: principal,
      takeHome: principal,
      totalPayableInterest: totalInterest,
      monthlyInstallments: monthlyPayment,
    });
  };

  // Calculate loan whenever amount or period changes
  useEffect(() => {
    calculateLoan(amount, period);
  }, [amount, period]);

  return (
    <>
      <div className={"space-y-4"}>
        <Link
          href={"/working-capital-funding"}
          className={
            "flex items-center gap-2 hover:underline text-[#62696F] text-sm font-medium"
          }
        >
          <ArrowLeft size={14} />
          Go Back
        </Link>
        <div className="shadow bg-white p-6 rounded">
          <div className={"flex justify-between items-center mb-4"}>
            <h1 className={"text-4xl font-bold"}>Loan application details</h1>
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-lg font-bold"
              title="Contact Support"
              onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}
            >
              Need Help
              <Icons.needHelp className="h-6 w-6" />
            </Button>
          </div>
          <p className={"text-2xl mb-8"}>
            Fill in your loan requirements below to get started with your
            application
          </p>

          {/* Calculator Form */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Calculator Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  How much funding do you need?{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className={errors.amount ? "border-red-500" : ""}
                    />
                  </div>
                  <div className="relative">
                    <div className="bg-[#E8E9EA] border-[#93989C] h-10 rounded-md border border-input px-3 py-2 text-sm min-w-[120px] flex items-center justify-center">
                      EUR
                    </div>
                  </div>
                  <div className="text-center">=</div>
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={convertAmount(
                        parseFloat(amount) || 0,
                        "EUR",
                        selectedCurrency,
                      ).toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="relative">
                    <select
                      className="bg-[#E8E9EA] border-[#93989C] h-10 rounded-md border border-input px-3 py-2 text-sm min-w-[120px]"
                      value={selectedCurrency}
                      onChange={(e) =>
                        handleCurrencyChange(
                          e.target.value as SupportedCurrency,
                        )
                      }
                    >
                      {/* Group currencies by region */}
                      <optgroup label="Primary Currencies">
                        {["USD", "KES", "EUR", "GBP"].map((currency) => (
                          <option key={currency} value={currency}>
                            {currency} -{" "}
                            {CURRENCY_NAMES[currency as SupportedCurrency]}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Major World Currencies">
                        {["CAD", "AUD", "JPY", "CHF", "CNY", "HKD", "SGD"].map(
                          (currency) => (
                            <option key={currency} value={currency}>
                              {currency} -{" "}
                              {CURRENCY_NAMES[currency as SupportedCurrency]}
                            </option>
                          ),
                        )}
                      </optgroup>
                      <optgroup label="African Currencies">
                        {[
                          "NGN",
                          "ZAR",
                          "GHS",
                          "UGX",
                          "TZS",
                          "RWF",
                          "EGP",
                          "MAD",
                        ].map((currency) => (
                          <option key={currency} value={currency}>
                            {currency} -{" "}
                            {CURRENCY_NAMES[currency as SupportedCurrency]}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Middle Eastern Currencies">
                        {["AED", "SAR", "QAR", "BHD", "KWD", "OMR"].map(
                          (currency) => (
                            <option key={currency} value={currency}>
                              {currency} -{" "}
                              {CURRENCY_NAMES[currency as SupportedCurrency]}
                            </option>
                          ),
                        )}
                      </optgroup>
                      <optgroup label="Asian Currencies">
                        {[
                          "INR",
                          "PKR",
                          "BDT",
                          "IDR",
                          "MYR",
                          "THB",
                          "KRW",
                          "VND",
                        ].map((currency) => (
                          <option key={currency} value={currency}>
                            {currency} -{" "}
                            {CURRENCY_NAMES[currency as SupportedCurrency]}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Other Major Currencies">
                        {["BRL", "MXN", "RUB", "TRY", "NZD"].map((currency) => (
                          <option key={currency} value={currency}>
                            {currency} -{" "}
                            {CURRENCY_NAMES[currency as SupportedCurrency]}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-[300px] space-y-2">
                          <p className="text-sm font-medium">
                            Currency Information
                          </p>
                          <ul className="text-xs space-y-1">
                            <li>
                              • Exchange rates are updated hourly from a
                              reliable forex data provider
                            </li>
                            <li>
                              • The converted amount is an approximation and may
                              vary at the time of disbursement
                            </li>
                            <li>
                              • Final exchange rate will be confirmed before
                              disbursement
                            </li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  defaultValue={[5000]}
                  max={MAX_AMOUNT}
                  min={MIN_AMOUNT}
                  step={100}
                  value={[parseFloat(amount)]}
                  onValueChange={handleSliderChange}
                  className="my-4"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>${MIN_AMOUNT.toLocaleString()}</span>
                  <span>${MAX_AMOUNT.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  What&apos;s your preferred repayment period?{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className={errors.period ? "border-red-500" : ""}
                  />
                  <span className=" bg-[#E8E9EA] border-[#93989C] border px-3 py-1.5 rounded-[4px]">
                    months
                  </span>
                </div>
                <Slider
                  defaultValue={[3]}
                  max={12}
                  min={3}
                  value={[parseInt(period)]}
                  onValueChange={handleMonthsSliderChange}
                  className="my-4"
                />
                {errors.period && (
                  <p className="text-sm text-red-500">{errors.period}</p>
                )}
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>3 months</span>
                  <span>6 months</span>
                  <span>9 months</span>
                  <span>12 months</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  How do you plan to use the funds?{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={errors.purpose ? "border-red-500" : ""}
                  placeholder="Enter the purpose of the loan"
                />
                {errors.purpose && (
                  <p className="text-sm text-red-500">{errors.purpose}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Maximum interest rate
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={INTEREST_RATE}
                    readOnly
                    className="pr-8 bg-gray-50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 mb-4">
                <Checkbox
                  checked={ecobankSubscription}
                  onCheckedChange={(checked: boolean) =>
                    setEcobankSubscription(checked)
                  }
                  id="ecobankSubscription"
                />
                <label
                  htmlFor="ecobankSubscription"
                  className="text-sm relative -top-1 "
                >
                  Through our partnership with Ecobank, you can now access
                  additional funding options. By checking this box, you confirm
                  interest in Ecobank loans and we&apos;ll share your details
                  with their team to explore loan options.
                </label>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-midnight-blue h-full flex flex-col">
              <div className={"mb-8 text-center"}>
                <h2 className="text-xl font-semibold mb-6">Total Loan</h2>
                <div className="text-4xl font-bold">
                  €
                  {calculation.totalLoan.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className={"text-lg text-[#62696F] mt-2"}>
                  ({selectedCurrency}{" "}
                  {(
                    exchangeRates[selectedCurrency] * Number(amount)
                  ).toLocaleString()}
                  )
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Your Take Home</span>
                  <div>
                    <span className="font-medium">
                      €
                      {calculation.takeHome.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      className={"text-[#444C53] text-xs leading-tight block"}
                    >
                      ({selectedCurrency}{" "}
                      {(
                        exchangeRates[selectedCurrency] * Number(amount)
                      ).toLocaleString()}
                      )
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-3" />

                <div className="flex justify-between">
                  <span>Total Payable Interest</span>
                  <div>
                    <span className="font-medium">
                      €
                      {calculation.totalPayableInterest.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </span>
                    <span
                      className={"text-[#444C53] text-xs leading-tight block"}
                    >
                      ({selectedCurrency}{" "}
                      {(
                        exchangeRates[selectedCurrency] *
                        Number(calculation.totalPayableInterest)
                      ).toLocaleString()}
                      )
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4" />

                <div className="flex justify-between">
                  <span>Monthly Installments</span>
                  <div>
                    <span className="font-medium">
                      €
                      {calculation.monthlyInstallments.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span
                      className={"text-[#444C53] text-xs leading-tight block"}
                    >
                      ({selectedCurrency}{" "}
                      {(
                        exchangeRates[selectedCurrency] *
                        Number(calculation.monthlyInstallments)
                      ).toLocaleString()}
                      )
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-auto bg-primary-green hover:bg-primary-green/90 flex items-center"
                size={"lg"}
                onClick={handleSubmit}
                disabled={
                  !amount ||
                  !period ||
                  !purpose ||
                  calculation.totalLoan === 0 ||
                  Object.values(errors).some((error) => error !== "")
                }
              >
                Submit Application
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader className="sm:text-center">
            <div className="mx-auto mb-4">
              <Icons.successIcon />
            </div>
            <div className="text-4xl font-medium">
              Application sent successfully!
            </div>
            <div
              className="text-center text-xl mt-10"
              style={{
                marginTop: "50px",
                marginBottom: "20px",
              }}
            >
              Your loan application has been sent successfully! Please be
              patient as we verify your details. Our team will reach out to you
              within 72 hours. Thank you for choosing us!
            </div>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              size={"lg"}
              className="bg-[#1C2024] text-white hover:bg-gray-800 px-9"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={failed} onOpenChange={setFailed}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader className="sm:text-center">
            <div className="mx-auto mb-4">
              <Icons.clipboardIcon />
            </div>
            <div className="text-4xl font-medium">You’re almost there!</div>
            <div
              className="text-center text-xl mt-10 text-[#62696F]"
              style={{
                marginTop: "50px",
                marginBottom: "20px",
              }}
            >
              Your onboarding checklist is{" "}
              <span className={"font-bold"}>
                {completionPercentage}% complete
              </span>
              .You need to complete at least 80% of the checklist to apply for
              this loan. Finishing the required steps ensures a smooth
              application process and helps us process your request faster.
            </div>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Link href={"/onboarding-checklist"}>
              <Button
                size={"lg"}
                className="bg-[#1C2024] text-white hover:bg-gray-800 px-9"
              >
                Complete Checklist
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default withAuth(Page);
