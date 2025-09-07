export type LoanStatus =
  | "Pending review"
  | "Approved"
  | "Rejected"
  | "Disbursed";
export type LoanProvider = "Melanin Kapital" | "Ecobank";

export interface LoanApplication {
  id: string;
  name: string;
  provider: LoanProvider;
  amount: number;
  tenure: number;
  status: LoanStatus;
  appliedOn: string;
  rejectionReason?: string;
  intendedUse?: string;
}

export interface LoanApplicationResponse {
  loanApplicationGuid: string;
  loanProductName: string;
  loanAmount: number;
  defaultCurrency: string;
  repaymentPeriod: string;
  loanPurpose: string;
  interestRate: number;
  loanStatus: number;
  businessGuid: string;
  personalGuid: string;
  createdDate?: string;
  rejectionReason?: string;
}

// Presta Loan Status Types
export type PrestaApprovalStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'FAILED';
export type PrestaApplicationStatus = 'NEWAPPLICATION' | 'INITIATED' | 'INPROGRESS' | 'COMPLETED' | 'FAILED';
export type PrestaDisbursementStatus = 'PENDING' | 'DISBURSED' | 'FAILED';

export interface PrestaLoan {
  refId: string;
  loanNo: number;
  requestedAmount: number;
  disbursementAmount: number;
  interestAmount: number;
  totalFees: number;
  totalPenalties: number;
  paymentsReceived: number;
  totalRepayableAmount: number;
  productRefId: string;
  disbursementDate: string;
  dueDate: string;
  applicationStatus: PrestaApplicationStatus;
  disbursementStatus: PrestaDisbursementStatus;
  approvalStatus: PrestaApprovalStatus;
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

export interface PrestaLoansResponse {
  start: number;
  length: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: PrestaLoan[];
}
