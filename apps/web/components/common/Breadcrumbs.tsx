"use client";

import React from "react";
import { Breadcrumb } from "antd";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  
  // Split the path and filter out empty strings and the locale segment
  const segments = pathname.split("/").filter((v) => v.length > 0);
  
  // Assuming the first segment is the locale (e.g., /en/dashboard -> ['en', 'dashboard'])
  const locale = segments[0];
  const pathSegments = segments.slice(1);

  if (pathSegments.length === 0) return null;

  const breadcrumbItems = [
    {
      title: <Link href={`/${locale}/dashboard`}>{t('dashboard')}</Link>,
    },
    ...pathSegments.map((segment, index) => {
      const url = `/${locale}/${pathSegments.slice(0, index + 1).join("/")}`;
      const isLast = index === pathSegments.length - 1;
      
      return {
        title: isLast ? (
          <span className="capitalize">{segment.replace(/-/g, " ")}</span>
        ) : (
          <Link href={url} className="capitalize">
            {segment.replace(/-/g, " ")}
          </Link>
        ),
      };
    }),
  ];

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ marginBottom: 16 }}
    />
  );
}
