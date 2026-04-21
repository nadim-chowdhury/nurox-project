"use client";

import React, { useEffect } from "react";
import { useGetMeQuery } from "../../store/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../../store/slices/authSlice";
import { RootState } from "../../store/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);

  // We call useGetMeQuery. Even if token is missing in Redux,
  // baseQueryWithReauth will attempt to refresh if the httpOnly cookie exists.
  const {
    data: userData,
    isError,
    isLoading,
  } = useGetMeQuery(undefined, {
    // If we already have user and token, we can skip or just let it revalidate
    skip: !!user && !!token,
  });

  useEffect(() => {
    if (userData && !user) {
      // User data loaded successfully (either with existing token or after silent refresh)
      // Note: setCredentials is usually called in onQueryStarted of login/register,
      // but for getMe we might need to ensure user is in state if it's not already.
      // However, authSlice should handle it if we add it to getMe endpoint.
    }
    if (isError && token) {
      dispatch(clearAuth());
    }
  }, [userData, user, isError, token, dispatch]);

  if (isLoading && !token) {
    // Optional: show a loading splash screen during initial auth check
    return null;
  }

  return <>{children}</>;
}
