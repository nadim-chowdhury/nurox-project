import { configureStore } from "@reduxjs/toolkit";
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

export const store = configureStore({
  reducer: {
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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
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
      .concat(recruitmentApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
