"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMagicLinkLoginMutation } from "@/store/api/authApi";
import { message } from "antd";

function MagicLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useMagicLinkLoginMutation();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      login({ token })
        .unwrap()
        .then(() => {
          message.success("Logged in successfully!");
          router.push("/dashboard");
        })
        .catch(() => {
          message.error("Invalid or expired magic link");
          router.push("/login");
        });
    } else {
      router.push("/login");
    }
  }, [token, login, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          {isLoading ? "Verifying magic link..." : "Redirecting..."}
        </h2>
        <p className="text-gray-500">Please wait while we log you in.</p>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MagicLinkContent />
    </Suspense>
  );
}
