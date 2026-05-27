"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Clock, CheckSquare } from "lucide-react";

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/en" },
    { label: "HR", icon: Users, href: "/en/hr" },
    { label: "Attendance", icon: Clock, href: "/en/attendance" },
    { label: "Tasks", icon: CheckSquare, href: "/en/projects" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-gray-200 bg-white/80 backdrop-blur-md pb-safe md:hidden dark:border-gray-800 dark:bg-gray-900/80">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${
              isActive
                ? "text-primary"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
