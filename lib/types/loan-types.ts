// Define interface for loan calculation
export interface LoanCalculation {
  totalLoan: number;
  takeHome: number;
  totalPayableInterest: number;
  monthlyInstallments: number;
}

// Define interface for loan quotation response from Presta API
export interface LoanQuotationResponse {
  refId: string;
  customerRefId: string;
  fullName: string;
  phoneNumber: string;
  productName: string;
  loanPeriod: number;
  repaymentPeriod: number;
  repaymentPeriodUnits: string;
  principal: number;
  interestRate: number;
  interestAmount: number;
  installmentFees: number;
  totalFees: number;
  totalAmount: number;
  disbursementAmount: number;
  installmentCount: number;
  monthlyInstallment: number;
  quotationNumber: string;
  loanFeeList: Array<{
    name: string;
    feeType: string;
    feeValue: number;
    amount: number;
    balance: number;
    deductionRule: string;
    allocationMethod: string;
    accountingStatus: string;
    paymentStatus: string;
  }>;
}

// Define interface for exchange rates
export interface ExchangeRates {
  [key: string]: number;
}

// Define interface for enriched loan product data
export interface EnrichedLoanProduct {
  refId: string;
  name: string;
  description: string;
  program: string;
  maximumAmount: string;
  interestRate: string;
  // Keep compatibility with existing loan product fields
  reference?: string;
  loanName?: string;
  loanPriceMax?: number;
  loanInterest?: number;
}
