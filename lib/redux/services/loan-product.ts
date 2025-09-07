import { apiSlice } from "./apiSlice";
import { LOAN_PRODUCT } from "@/lib/constants/tags";
import type {
  LoanProduct,
  GetAllLoanProductsResponse,
} from "@/lib/types/loan-product";

export const loanProductApiSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllLoanProducts: build.query<LoanProduct[], string>({
      query: (businessGuid) => ({
        url: "/Business/GetAllLoanProducts",
        method: "POST",
        body: { businessGuid },
      }),
      transformResponse: (response: GetAllLoanProductsResponse) =>
        response?.loanProductList || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: LOAN_PRODUCT,
                id: id.toString(),
              })),
              { type: LOAN_PRODUCT, id: "LIST" },
            ]
          : [{ type: LOAN_PRODUCT, id: "LIST" }],
    }),
  }),
});

export const { useGetAllLoanProductsQuery } = loanProductApiSlice;
