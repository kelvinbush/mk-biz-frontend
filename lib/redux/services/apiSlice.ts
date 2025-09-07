import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import {
  AUTH,
  FUNDING,
  LOAN_PRODUCT,
  LOAN_APPLICATIONS,
  SAVED_FUNDING,
  USER,
} from "@/lib/constants/tags";
import { logOut, setAccessToken } from "@/lib/redux/features/authSlice";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dev.api.melaninkapital.com/api";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Try to get token from Redux state first
    const token = (getState() as RootState).auth?.token;

    const fallbackToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token || fallbackToken) {
      headers.set("Authorization", `Bearer ${token || fallbackToken}`);
    }
    return headers;
  },
});

const baseQueryWithReAuth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: NonNullable<unknown>,
) => {
  let result = await baseQuery(args, api, extraOptions);
  // If we receive a 401 Unauthorized
  if (result.error && result.error.status === 401) {
    // Check if the original request was a login attempt
    const isLoginRequest =
      typeof args === "string"
        ? args === "/Authentication/Login"
        : args.url === "/Authentication/Login";

    const isRegisterRequest =
      typeof args === "string"
        ? args === "/Authentication/Register"
        : args.url === "/Authentication/Register";

    const isForgetPasswordRequest =
      typeof args === "string"
        ? args === "/Authentication/GetPasswordCode"
        : args.url === "/Authentication/GetPasswordCode";

    if (!isLoginRequest && !isRegisterRequest && !isForgetPasswordRequest) {
      // If it wasn't a login request, log out
      api.dispatch(logOut());
      return result;
    }

    // For login requests, try to refresh token
    const refreshResult = await baseQuery(
      {
        url: "/Token/RequestToken",
        method: "POST",
        body: {
          consumerKey: process.env.NEXT_PUBLIC_CONSUMER_KEY,
          consumerSecret: process.env.NEXT_PUBLIC_CONSUMER_SECRET,
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Store the new token
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      api.dispatch(setAccessToken(refreshResult.data?.token as string));
      // Retry the initial query
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth,
  endpoints: () => ({}),
  tagTypes: [
    USER,
    AUTH,
    FUNDING,
    SAVED_FUNDING,
    LOAN_PRODUCT,
    LOAN_APPLICATIONS,
  ],
});
