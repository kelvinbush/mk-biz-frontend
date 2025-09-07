import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './services/apiSlice'
import authReducer from './features/authSlice'
import topBarReducer from './features/top-bar.slice'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    topBar: topBarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
