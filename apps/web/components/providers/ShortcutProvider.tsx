"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useRedux";
import { toggleCommandPalette, toggleSidebar } from "@/store/slices/uiSlice";

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Command Palette (⌘K or Ctrl+K)
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(toggleCommandPalette());
      }

      // 2. Toggle Sidebar (⌘B or Ctrl+B)
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(toggleSidebar());
      }

      // 3. Quick Navigation
      // Alt + H -> Home/Dashboard
      if (e.altKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        router.push("/dashboard");
      }

      // Alt + E -> Employees
      if (e.altKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        router.push("/hr/employees");
      }

      // Alt + S -> Settings
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        router.push("/settings");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, router]);

  return <>{children}</>;
}
