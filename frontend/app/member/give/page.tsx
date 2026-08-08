"use client";

import dynamic from "next/dynamic";

const GiveForm = dynamic(() => import("@/components/GiveForm"), {
  ssr: false,
});

export default function MemberGivePage() {
  return <GiveForm />;
}

