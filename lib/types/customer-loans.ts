export interface LoanBalances {
  principalBalance: number;
  interestBalance: number;
  feesBalance: number;
  penaltiesBalance: number;
}

export interface CustomerLoan {
  refId: string;
  loanNo: number;
  requestedAmount: number;
  disbursementAmount: number;
  interestAmount: number;
  totalFees: number;
  totalPenalties: number;
  paymentsReceived: number;
  totalRepayableAmount: number;
  loanBalance: number;
  productRefId: string;
  loanBalances: LoanBalances;
  disbursementDate: string;
  dueDate: string;
  applicationStatus: string;
  disbursementStatus: string;
  repaymentStatus: string;
  accountingStatus: string;
  disbursementMethod: string;
  unearnedIncome: number;
  customerNetLoanBalance: number;
  email: string;
  currency: string;
  fullName: string;
  loanDesc: string;
}

export interface CustomerLoansResponse {
  start: number;
  length: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: CustomerLoan[];
}
