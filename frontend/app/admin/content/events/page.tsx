"use client";

import React, { useState } from "react";
import AdminPageTemplate from "@/components/admin/layout/AdminPageTemplate";
import EventManagement from "@/components/admin/EventManagement";
import { CalendarDays } from "lucide-react";

export default function EventsContentPage() {
  const [loading, setLoading] = useState(false);

  return (
    <AdminPageTemplate
      title="Church Calendar & Events Manager"
      description="Schedule upcoming worship services, prayer vigils, conferences, youth rallies, and location details."
      icon={CalendarDays}
      isLoading={loading}
    >
      <EventManagement />
    </AdminPageTemplate>
  );
}
