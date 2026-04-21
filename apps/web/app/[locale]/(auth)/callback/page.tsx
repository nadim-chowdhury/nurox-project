"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAccessToken } from "@/store/slices/authSlice";
import { useGetMeQuery } from "@/store/api/authApi";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const token = searchParams.get("token");

  // Fetch user data once we have the token
  const {
    data: user,
    isSuccess,
    isError,
  } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (token) {
      dispatch(setAccessToken(token));
    } else {
      router.push("/login");
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (isSuccess && user) {
      router.push("/dashboard");
    }
    if (isError) {
      router.push("/login?error=OAuth failed");
    }
  }, [isSuccess, user, isError, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing login...</h2>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
