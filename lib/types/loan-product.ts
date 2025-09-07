export interface LoanProduct {
  loanName: string;
  description: string;
  id: number;
  partnerReference: string;
  partnerName: string;
  integrationType: number;
  loanProductType: number;
  loanPriceMax: number;
  loanInterest: number;
  status: number;
  reference: string;
}

export interface GetAllLoanProductsResponse {
  loanProductList: LoanProduct[];
  status: string;
  message: string;
}
