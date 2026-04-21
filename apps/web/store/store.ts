import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import notificationReducer from "./slices/notificationSlice";
import { authApi } from "./api/authApi";
import { usersApi } from "./api/usersApi";
import { employeeApi } from "./api/employeeApi";
import { projectsApi } from "./api/projectsApi";
import { salesApi } from "./api/salesApi";
import { systemApi } from "./api/systemApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    [systemApi.reducerPath]: systemApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(usersApi.middleware)
      .concat(employeeApi.middleware)
      .concat(projectsApi.middleware)
      .concat(salesApi.middleware)
      .concat(systemApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
