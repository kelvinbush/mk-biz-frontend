import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/lib/redux/store";

// Helper function to safely access localStorage
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

// Helper function to safely set localStorage
const setLocalStorageItem = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

const initialState: {
  token: string | null;
  userGuid: string | null;
  userEmail: string | null;
  userPhone: string | null;
} = {
  token: getLocalStorageItem("token"),
  userGuid: getLocalStorageItem("userGuid"),
  userEmail: getLocalStorageItem("userEmail"),
  userPhone: getLocalStorageItem("userPhone"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      const token = action.payload;
      state.token = token;
      setLocalStorageItem("token", token);
    },
    setUserId: (state, action) => {
      const { userGuid, userEmail, userPhone } = action.payload;
      state.userGuid = userGuid;
      state.userEmail = userEmail;
      state.userPhone = userPhone;

      setLocalStorageItem("userGuid", userGuid);
      setLocalStorageItem("userEmail", userEmail);
      setLocalStorageItem("userPhone", userPhone);
    },
    logOut: (state) => {
      state.token = null;
      state.userGuid = null;
      state.userEmail = null;
      state.userPhone = null;
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
        localStorage.clear();
      }
    },
  },
});

export const { setAccessToken, logOut, setUserId } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentToken = (state: RootState) => state.auth.userGuid;
export const selectUserEmail = (state: RootState) => state.auth.userEmail;
