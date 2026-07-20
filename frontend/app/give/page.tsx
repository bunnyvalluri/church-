"use client";

import GiveForm from "@/components/GiveForm";
import Footer from "@/components/layout/Footer";
import MemberLayout from "@/app/member/layout";
import { useAuth } from "@/components/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";

export default function GivePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <MemberLayout>
        <GiveForm />
      </MemberLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navbar />
      <GiveForm />
      <Footer />
    </div>
  );
}