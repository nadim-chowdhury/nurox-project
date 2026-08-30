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

  const hasCookie =
    typeof document !== "undefined" &&
    document.cookie.includes("nurox_refresh_token");

  const {
    data: userData,
    isError,
    isLoading: _isLoading,
  } = useGetMeQuery(undefined, {
    skip: (!!user && !!token) || (!token && !hasCookie),
  });

  useEffect(() => {
    if (isError && token) {
      dispatch(clearAuth());
    }
  }, [userData, user, isError, token, dispatch]);

  return <>{children}</>;
}
