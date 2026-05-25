import { CareerPortalClient } from "@/components/modules/hr/recruitment/CareerPortalClient";
import { headers } from "next/headers";

// Enable ISR
export const revalidate = 3600;

async function getJobs(tenantId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  
  try {
    const res = await fetch(`${apiUrl}/public/recruitment/jobs`, {
      headers: {
        "x-tenant-id": tenantId,
      },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
      return [];
    }
    
    return res.json();
  } catch (err) {
    console.error("Error fetching jobs for career portal:", err);
    return [];
  }
}

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  
  // Resolve tenantId (matches middleware logic)
  let tenantId = "public";
  const baseDomain = "nurox.app";
  
  if (host.includes("localhost")) {
    const parts = host.split(".");
    if (parts.length > 1 && parts[0]) {
      tenantId = parts[0];
    }
  } else if (host.endsWith(`.${baseDomain}`)) {
    tenantId = host.replace(`.${baseDomain}`, "");
  } else if (!host.includes(baseDomain)) {
    tenantId = host;
  }

  if (["www", "app", "public"].includes(tenantId)) {
    tenantId = "public";
  }

  const jobs = await getJobs(tenantId);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      <CareerPortalClient initialJobs={jobs} />
    </div>
  );
}
