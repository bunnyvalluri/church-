"use client";

import dynamic from "next/dynamic";
import { usePreventContextMenu } from "@/hooks/usePreventContextMenu";

const GiveForm = dynamic(() => import("@/components/GiveForm"), {
  ssr: false,
});

export default function MemberGivePage() {
  usePreventContextMenu();

  return (
    <div onContextMenu={(e) => e.preventDefault()} className="w-full pb-28 sm:pb-32 lg:pb-12">
      <GiveForm />
    </div>
  );
}

