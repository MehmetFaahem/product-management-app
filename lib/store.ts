"use client";

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "@/features/auth/authSlice";
import { api } from "@/services/api";

const rootReducer = combineReducers({
  auth: authReducer,
  [api.reducerPath]: api.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(api.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = ReturnType<AppStore["dispatch"]>;
export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;

export const setupStore = () => {
  const store = makeStore();
  const persistor = persistStore(store);
  return { store, persistor };
};

export const useAppDispatch = () =>
  useDispatch<ReturnType<typeof makeStore>["dispatch"]>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
