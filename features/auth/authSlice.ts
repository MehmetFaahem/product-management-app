"use client";

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/services/api";

interface AuthState {
  token: string | null;
  email: string | null;
}

const initialState: AuthState = {
  token: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; email: string }>
    ) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
    },
    logout: (state) => {
      state.token = null;
      state.email = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const logoutAndClearCache = createAsyncThunk(
  "auth/logoutAndClearCache",
  async (_, { dispatch }) => {
    dispatch(logout());

    dispatch(api.util.resetApiState());

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("persist:root");
      }
    } catch {}

    return null;
  }
);

export default authSlice.reducer;
