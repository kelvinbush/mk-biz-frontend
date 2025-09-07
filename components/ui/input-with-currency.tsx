"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyOption {
  code: string;
  value: string;
  flag: string;
}

const currencies: CurrencyOption[] = [
  { code: "USD", value: "USD", flag: "🇺🇸" },
  { code: "EUR", value: "EUR", flag: "🇪🇺" },
  { code: "GBP", value: "GBP", flag: "🇬🇧" },
  { code: "KES", value: "KES", flag: "🇰🇪" },
  { code: "NGN", value: "NGN", flag: "🇳🇬" },
  { code: "ZAR", value: "ZAR", flag: "🇿🇦" },
  { code: "GHS", value: "GHS", flag: "🇬🇭" },
];

interface InputWithCurrencyProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  currencyValue: string;
  onCurrencyValueChange: (value: string) => void;
  currencyPlaceholder?: string;
  className?: string;
  error?: boolean;
}

const InputWithCurrency = React.forwardRef<
  HTMLInputElement,
  InputWithCurrencyProps
>(
  (
    {
      className,
      currencyValue = "USD", // Default to USD if undefined
      onCurrencyValueChange,
      currencyPlaceholder = "Currency",
      error,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Find the selected currency
    const selectedCurrency = currencies.find(currency => currency.value === currencyValue);
    
    return (
      <div className={cn("flex w-full", className)}>
        <div className="relative flex-grow">
          <input
            className={cn(
              "flex h-9 w-full px-3 py-1 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-ring text-base shadow-sm transition-colors",
              error ? "border-red-500" : "border-input",
              "rounded-r-none border-r-0"
            )}
            ref={ref}
            {...props}
          />
        </div>
        <div className="w-[100px] relative" ref={dropdownRef}>
          <button
            type="button"
            className={cn(
              "w-full h-9 flex items-center justify-between px-3 py-1 border rounded-r-md",
              error ? "border-red-500" : "border-input",
              "rounded-l-none border-l-0 bg-primaryGrey-50 text-sm"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {selectedCurrency ? (
              <span className="flex items-center">
                <span className="mr-2">{selectedCurrency.flag}</span>
                <span>{selectedCurrency.code}</span>
              </span>
            ) : (
              <span>{currencyPlaceholder}</span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {currencies.map((currency) => (
                <div
                  key={currency.code}
                  className="px-3 py-2 cursor-pointer hover:bg-primaryGrey-50 text-sm"
                  onClick={() => {
                    onCurrencyValueChange(currency.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="flex items-center">
                    <span className="mr-2">{currency.flag}</span>
                    <span>{currency.code}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

InputWithCurrency.displayName = "InputWithCurrency";

export { InputWithCurrency, currencies };
