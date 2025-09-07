import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState: { title: string } = {
  title: "Dashboard",
};

export const topBarSlice = createSlice({
  name: "topBar",
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
  },
});

export const { setTitle } = topBarSlice.actions;

export const selectTopBar = (state: RootState) => state.topBar.title;

export default topBarSlice.reducer;
