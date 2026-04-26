"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useAppSelector } from "@/hooks/useRedux";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const tenantId = useAppSelector((state) => state.auth.user?.tenantId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false, // Handled manually or via router
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        tenantId: tenantId,
      });
    } else {
      posthog.reset();
    }
  }, [user, tenantId]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
