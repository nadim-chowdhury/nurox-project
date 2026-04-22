"use client";

import React from "react";
import { OnboardingPortal } from "@/components/modules/hr/recruitment/OnboardingPortal";
import { useParams } from "next/navigation";

export default function CandidateOnboardingPage() {
  const params = useParams();
  const candidateId = params.candidateId as string;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <OnboardingPortal candidateId={candidateId} />
    </div>
  );
}
