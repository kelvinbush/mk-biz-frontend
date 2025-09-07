export type SupportedCurrency =
  | "KES"
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "JPY"
  | "CHF"
  | "CNY"
  | "HKD"
  | "SGD"
  | "NGN"
  | "ZAR"
  | "GHS"
  | "UGX"
  | "TZS"
  | "RWF"
  | "EGP"
  | "MAD"
  | "AED"
  | "SAR"
  | "QAR"
  | "BHD"
  | "KWD"
  | "OMR"
  | "INR"
  | "PKR"
  | "BDT"
  | "IDR"
  | "MYR"
  | "THB"
  | "KRW"
  | "VND"
  | "BRL"
  | "MXN"
  | "RUB"
  | "TRY"
  | "NZD";

// Currency names mapping
export const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  // Primary currencies
  USD: "US Dollar",
  KES: "Kenyan Shilling",
  EUR: "Euro",
  GBP: "British Pound",
  // Major world currencies
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  HKD: "Hong Kong Dollar",
  SGD: "Singapore Dollar",
  // African currencies
  NGN: "Nigerian Naira",
  ZAR: "South African Rand",
  GHS: "Ghanaian Cedi",
  UGX: "Ugandan Shilling",
  TZS: "Tanzanian Shilling",
  RWF: "Rwandan Franc",
  EGP: "Egyptian Pound",
  MAD: "Moroccan Dirham",
  // Middle Eastern currencies
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  QAR: "Qatari Riyal",
  BHD: "Bahraini Dinar",
  KWD: "Kuwaiti Dinar",
  OMR: "Omani Rial",
  // Asian currencies
  INR: "Indian Rupee",
  PKR: "Pakistani Rupee",
  BDT: "Bangladeshi Taka",
  IDR: "Indonesian Rupiah",
  MYR: "Malaysian Ringgit",
  THB: "Thai Baht",
  KRW: "South Korean Won",
  VND: "Vietnamese Dong",
  // Other major currencies
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  RUB: "Russian Ruble",
  TRY: "Turkish Lira",
  NZD: "New Zealand Dollar",
};

// Currency groupings for dropdown organization
export const CURRENCY_GROUPS = {
  primaryCurrencies: ["USD", "KES", "EUR", "GBP"],
  majorWorldCurrencies: ["CAD", "AUD", "JPY", "CHF", "CNY", "HKD", "SGD"],
  africanCurrencies: ["NGN", "ZAR", "GHS", "UGX", "TZS", "RWF", "EGP", "MAD"],
  middleEasternCurrencies: ["AED", "SAR", "QAR", "BHD", "KWD", "OMR"],
  asianCurrencies: ["INR", "PKR", "BDT", "IDR", "MYR", "THB", "KRW", "VND"],
  otherMajorCurrencies: ["BRL", "MXN", "RUB", "TRY", "NZD"]
};
