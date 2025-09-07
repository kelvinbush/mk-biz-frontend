import { apiSlice } from "./apiSlice";
import { FUNDING, SAVED_FUNDING } from "@/lib/constants/tags";

interface FundingOpportunity {
  name: string;
  countryOfOrigin: string;
  totalFundSize: string;
  sectorFocusSsa: string;
  countriesOfOperation: string;
  operatingSince: string;
  website: string;
  reference: string;
  adminGuid: string;
}

interface GetAllFundingOpportunitiesResponse {
  fundingOpportunities: FundingOpportunity[];
}

export const fundingApiSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllFundingOpportunities: build.query<
      GetAllFundingOpportunitiesResponse,
      void
    >({
      query: () => ({
        url: "/FundingOpportunity/GetAllFundingOpportunities",
        method: "POST",
        body: {},
      }),
      providesTags: [{ type: FUNDING, id: "LIST" }],
    }),
    getSavedFundingOpportunities: build.query<
      GetAllFundingOpportunitiesResponse,
      string
    >({
      query: (guid) => ({
        url: "/FundingOpportunity/GetBookmarkedFundingOpportunities",
        method: "POST",
        body: { personalGuid: guid },
      }),
      providesTags: [{ type: SAVED_FUNDING, id: "LIST" }],
    }),
    saveFundingOpportunity: build.mutation<
      void,
      { personalGuid: string; fundingOpportunityGuid: string }
    >({
      query: ({ personalGuid, fundingOpportunityGuid }) => ({
        url: "/FundingOpportunity/BookmarkFundingOpportunity",
        method: "POST",
        body: { personalGuid, fundingOpportunityGuid },
      }),
      invalidatesTags: [{ type: SAVED_FUNDING, id: "LIST" }],
    }),
    deleteSavedFundingOpportunity: build.mutation<
      void,
      {
        fundId: string;
        personalGuid: string;
      }
    >({
      query: ({ fundId, personalGuid }) => ({
        url: "/FundingOpportunity/DeleteBookmarkedFundingOpportunity",
        method: "DELETE",
        body: {
          fundingOpportunityGuid: fundId,
          personalGuid: personalGuid,
        },
      }),
      invalidatesTags: [{ type: SAVED_FUNDING, id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllFundingOpportunitiesQuery,
  useGetSavedFundingOpportunitiesQuery,
  useDeleteSavedFundingOpportunityMutation,
  useSaveFundingOpportunityMutation,
} = fundingApiSlice;
