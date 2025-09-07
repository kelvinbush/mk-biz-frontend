import { apiSlice } from "./apiSlice";
import { LOAN_APPLICATIONS } from "@/lib/constants/tags";
import { LoanApplicationResponse } from "@/app/(dashboard)/loan-applications/_utils/types";

export interface LoanApplication {
  loanProductName: string;
  loanAmount: number;
  defaultCurrency: string;
  repaymentPeriod: string;
  loanPurpose: string;
  interestRate: number;
  ecobankSubscription: boolean;
  loanStatus: number;
  businessGuid: string;
  personalGuid: string;
  loanProductId?: string; // Optional loan product ID from partner loans
}

export interface LoanApplicationV2 {
  loanProductReference: string;
  loanAmount: number;
  repaymentPeriod: string;
  loanPurpose: string;
  businessGuid: string;
}

export const loansApiSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    applyForLoan: build.mutation<void, LoanApplication>({
      query: (loanApplication) => ({
        url: "/LoanApplication/CreateLoanApplication",
        method: "POST",
        body: loanApplication,
      }),
      invalidatesTags: [LOAN_APPLICATIONS],
    }),
    applyForLoanV2: build.mutation<void, LoanApplicationV2>({
      query: (loanApplication) => ({
        url: "/LoanApplication/CreateLoanApplicationV2",
        method: "POST",
        body: loanApplication,
      }),
      invalidatesTags: [LOAN_APPLICATIONS],
    }),
    getLoanApplications: build.query<
      LoanApplicationResponse[],
      { businessGuid: string }
    >({
      query: (payload) => ({
        url: "/LoanApplication/GetLoanApplicationsByBusiness",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        loanApplications: LoanApplicationResponse[];
      }) => {
        return response.loanApplications || [];
      },
      providesTags: [
        {
          type: LOAN_APPLICATIONS,
          id: "LIST",
        },
      ],
    }),
  }),
});

export const {
  useApplyForLoanMutation,
  useApplyForLoanV2Mutation,
  useGetLoanApplicationsQuery,
} = loansApiSlice;
