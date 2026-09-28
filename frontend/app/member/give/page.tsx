"use client";

import dynamic from "next/dynamic";
import { usePreventContextMenu } from "@/hooks/usePreventContextMenu";

const GiveForm = dynamic(() => import("@/components/GiveForm"), {
  ssr: false,
});

export default function MemberGivePage() {
  usePreventContextMenu();

  return (
    <div onContextMenu={(e) => e.preventDefault()} className="w-full">
      <GiveForm />
    </div>
  );
}

