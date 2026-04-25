import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import notificationReducer from "./slices/notificationSlice";
import { authApi } from "./api/authApi";
import { usersApi } from "./api/usersApi";
import { hrApi } from "./api/hrApi";
import { projectsApi } from "./api/projectsApi";
import { salesApi } from "./api/salesApi";
import { systemApi } from "./api/systemApi";
import { analyticsApi } from "./api/analyticsApi";
import { payrollApi } from "./api/payrollApi";
import { attendanceApi } from "./api/attendanceApi";
import { inventoryApi } from "./api/inventoryApi";
import { procurementApi } from "./api/procurementApi";
import { recruitmentApi } from "./api/recruitmentApi";
import { notificationApi } from "./api/notificationApi";
import { financeApi } from "./api/financeApi";

/**
 * Persist config — only the auth slice is persisted to localStorage.
 * This ensures the user stays logged in across page refreshes.
 * RTK Query caches are NOT persisted (re-fetched on mount).
 */
const persistConfig = {
  key: "nurox",
  storage,
  whitelist: [
    "auth", 
    "ui",
    "hrApi",
    "projectsApi",
    "salesApi",
    "inventoryApi",
    "financeApi"
  ],
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  notifications: notificationReducer,
  [authApi.reducerPath]: authApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [hrApi.reducerPath]: hrApi.reducer,
  [projectsApi.reducerPath]: projectsApi.reducer,
  [salesApi.reducerPath]: salesApi.reducer,
  [systemApi.reducerPath]: systemApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [payrollApi.reducerPath]: payrollApi.reducer,
  [attendanceApi.reducerPath]: attendanceApi.reducer,
  [inventoryApi.reducerPath]: inventoryApi.reducer,
  [procurementApi.reducerPath]: procurementApi.reducer,
  [recruitmentApi.reducerPath]: recruitmentApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [financeApi.reducerPath]: financeApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches non-serializable actions — ignore them
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(hrApi.middleware)
      .concat(projectsApi.middleware)
      .concat(salesApi.middleware)
      .concat(systemApi.middleware)
      .concat(analyticsApi.middleware)
      .concat(payrollApi.middleware)
      .concat(attendanceApi.middleware)
      .concat(inventoryApi.middleware)
      .concat(procurementApi.middleware)
      .concat(recruitmentApi.middleware)
      .concat(notificationApi.middleware)
      .concat(financeApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
