import { apiSlice } from "./apiSlice";
import { AUTH } from "@/lib/constants/tags";

export interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  gender: string;
  dateOfBirth: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<
      { token: string; guid: string },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/Authentication/Login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: AUTH, id: "AUTH" }],
    }),
    registerUser: build.mutation<
      { token: string; guid: string },
      SignUpFormValues
    >({
      query: (credentials) => ({
        url: "/Authentication/Register",
        method: "POST",
        body: {
          ...credentials,
          address: "",
          city: "",
          county: "",
          positionHeld: "",
          program: "",
          profilePhoto: "",
          taxIdNumber: "",
          identityDocType: "",
          identityDocNumber: "",
          prestaRef: "",
        },
      }),
    }),
    forgotPassword: build.mutation<void, { email: string }>({
      query: (credentials) => ({
        url: "/Authentication/GetPasswordCode",
        method: "POST",
        body: credentials,
      }),
    }),
    resetPassword: build.mutation<void, { code: string; guid: string }>({
      query: (data) => ({
        url: "/Authentication/PostResetPasswordCode",
        method: "POST",
        body: data,
      }),
    }),
    resendEmailOtp: build.mutation<void, { guid: string }>({
      query: (credentials) => ({
        url: "/Authentication/ResendUserEmailOtp",
        method: "POST",
        body: credentials,
      }),
    }),
    resendPhoneOtp: build.mutation<void, { guid: string }>({
      query: (credentials) => ({
        url: "/Authentication/ResendUserSmsOtp",
        method: "POST",
        body: credentials,
      }),
    }),
    newPassword: build.mutation<
      void,
      { personalGuid: string; password: string }
    >({
      query: (data) => ({
        url: "/Authentication/PostResetPassword",
        method: "POST",
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendEmailOtpMutation,
  useResendPhoneOtpMutation,
  useRegisterUserMutation,
  useNewPasswordMutation,
} = authApi;
