import { TAddBusiness } from "@/components/auth/forms/add-business.validation";
import { apiSlice } from "./apiSlice";
import { USER } from "@/lib/constants/tags";
import type {
  BusinessDocument,
  BusinessProfile,
  PersonalDocument,
  UserResponse,
} from "@/lib/types/user";
import { TProfileForm } from "@/components/my-profile/components/personal-information";

interface UploadDocumentRequest {
  path: string;
  docType: number;
  businessGuid: string;
  BankCode?: string;
  pin?: string;
  documentId?: string;
}

interface UpdateDocumentRequest extends UploadDocumentRequest {
  documentId: string;
}

interface GetPersonalDocumentsRequest {
  personalGuid: string;
}

interface UploadPersonalDocumentRequest {
  path: string;
  docType: number;
  personalGuid: string;
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getUser: build.query<UserResponse, { guid: string }>({
      query: (credentials) => ({
        url: "/PersonalProfile/GetPersonalProfile",
        method: "POST",
        body: credentials,
      }),
      providesTags: [{ type: USER, id: "USER" }],
    }),
    verifyEmail: build.mutation<void, { guid: string; code: string }>({
      query: (credentials) => ({
        url: "/Authentication/VerifyEmail",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: USER, id: "USER" }],
    }),
    updateUserProfile: build.mutation<
      void,
      { guid: string; profile: TProfileForm }
    >({
      query: (data) => ({
        url: "/PersonalProfile/UpdatePersonalProfile",
        method: "PUT",
        body: {
          ...data.profile,
          guid: data.guid,
        },
      }),
      invalidatesTags: [{ type: USER, id: "USER" }],
    }),
    verifyPhoneNumber: build.mutation<void, { guid: string; code: string }>({
      query: (credentials) => ({
        url: "/Authentication/VerifyPhone",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: USER, id: "USER" }],
    }),
    addBusiness: build.mutation<void, { business: TAddBusiness; guid: string }>(
      {
        query: (data) => {
          const { business, guid } = data;
          const formattedData = {
            ...business,
            businessName: business.name,
            sector: business.sector,
            businessDescription: business.description,
            yearOfRegistration: business.year,
            location: business.location,
            isBeneficalOwner: business.isBeneficialOwner,
            country: business.location,
            typeOfIncorporation: business.legal,
            beneficialOwnerType: business.beneficialOwnerType || "",
            beneficialOwnerShareholding:
              business.beneficialOwnerShareholding || 0,
            businessLogo: "",
            city: "",
            street1: "",
            street2: "",
            postalCode: "",
            averageAnnualTurnover: 0.0,
            averageMonthlyTurnover: 0.0,
            previousLoans: true,
            loanAmount: 0.0,
            recentLoanStatus: "",
            defaultReason: "",
            personalGuid: guid,
            defaultCurrency: "KES",
            currency: "USD",
          };

          return {
            url: "/Business/RegisterBusiness",
            method: "POST",
            body: formattedData,
          };
        },
        invalidatesTags: [
          { type: USER, id: "USER" },
          {
            type: USER,
            id: "BUSINESS",
          },
        ],
      },
    ),
    forgotPassword: build.mutation<void, string>({
      query: (email) => ({
        url: "/Authentication/GetPasswordCode",
        method: "POST",
        body: { email },
      }),
    }),
    getBusinessProfile: build.query<
      { business: BusinessProfile },
      { guid: string }
    >({
      query: (credentials) => ({
        url: "/Authentication/GetBusinessProfile",
        method: "POST",
        body: credentials,
      }),
      providesTags: [{ type: USER, id: "BUSINESS" }],
    }),
    getBusinessProfileByPersonalGuid: build.query<
      { business: BusinessProfile },
      { guid: string }
    >({
      query: (credentials) => ({
        url: "/Business/GetBusinessProfileByPersonalGuid",
        method: "POST",
        body: credentials,
      }),
      providesTags: [{ type: USER, id: "BUSINESS" }],
    }),
    getBusinessDocuments: build.query<
      { documents: BusinessDocument[] },
      { businessGuid: string }
    >({
      query: (credentials) => ({
        url: "/Business/GetBusinessDocuments",
        method: "POST",
        body: credentials,
      }),
      providesTags: [{ type: USER, id: "BUSINESS_DOCUMENTS" }],
    }),
    uploadBusinessDocument: build.mutation<void, UploadDocumentRequest>({
      query: (payload) => ({
        url: "/Business/UploadDocuments",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: USER, id: "BUSINESS_DOCUMENTS" }],
    }),
    updateBusinessDocument: build.mutation<void, UpdateDocumentRequest>({
      query: (payload) => ({
        url: "/Business/UpdateDocument",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: [{ type: USER, id: "BUSINESS_DOCUMENTS" }],
    }),
    getPersonalDocuments: build.query<
      { documents: PersonalDocument[] },
      GetPersonalDocumentsRequest
    >({
      query: (payload) => ({
        url: "/PersonalProfile/GetPersonalDocuments",
        method: "POST",
        body: payload,
      }),
      providesTags: [{ type: USER, id: "PERSONAL_DOCUMENTS" }],
    }),
    uploadPersonalDocument: build.mutation<void, UploadPersonalDocumentRequest>(
      {
        query: (payload) => ({
          url: "/PersonalProfile/UploadPersonalDocuments",
          method: "POST",
          body: payload,
        }),
        invalidatesTags: [{ type: USER, id: "PERSONAL_DOCUMENTS" }],
      },
    ),
    updateBusinessProfile: build.mutation<void, BusinessProfile>({
      query: (data) => ({
        url: "Business/UpdateBusinessProfile",
        method: "PUT",
        body: { ...data },
      }),
      invalidatesTags: [{ type: USER, id: "BUSINESS" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserQuery,
  useGetBusinessProfileQuery,
  useGetBusinessProfileByPersonalGuidQuery,
  useGetBusinessDocumentsQuery,
  useAddBusinessMutation,
  useForgotPasswordMutation,
  useVerifyEmailMutation,
  useVerifyPhoneNumberMutation,
  useUpdateUserProfileMutation,
  useUploadBusinessDocumentMutation,
  useUpdateBusinessDocumentMutation,
  useGetPersonalDocumentsQuery,
  useUploadPersonalDocumentMutation,
  useUpdateBusinessProfileMutation,
} = userApiSlice;
