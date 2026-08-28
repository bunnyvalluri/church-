# Public Events & Multi-Branch Service Schedule

## Purpose
This document specifies the architecture, calendar systems, branch scheduling, public registration workflows, and social discovery features for church events across the Kingdom of Christ Ministries platform.

## Scope
Covers public event routes (`frontend/app/events/`), branch filtering, calendar export integrations (iCal / Google Calendar), and event registration APIs.

## Status
> Status: Implemented

---

## 1. Event Discovery & Branch Architecture

The church operates multiple regional branch sanctuaries across Hyderabad. The events module provides seamless filtering across all locations:

```mermaid
graph TD
    User[Website Visitor / Member] --> EventsHome[/events Page]
    
    subgraph Multi-Branch Filtering
        EventsHome --> AllBranches[All Church Events]
        EventsHome --> Shapur[Shapur Nagar Main Sanctuary]
        EventsHome --> Subhash[Subhash Nagar Sanctuary]
        EventsHome --> Bahadur[Bahadurpally Sanctuary]
    end

    subgraph Event Details & Engagement
        EventsHome --> EventDetail[/events/[slug] Page]
        EventDetail --> RegisterAction[Register for Event]
        EventDetail --> AddToCal[Add to Google Calendar / iCal]
        EventDetail --> ShareAction[Share on WhatsApp / Social Media]
        EventDetail --> MapDirections[Open Google Maps Venue Directions]
    end
```

---

## 2. Event Categories & Tags

- **Sunday Worship Services**: Regular morning and evening worship gatherings.
- **Conferences & Special Summits**: Multi-day annual spiritual conferences and leadership summits with strict seat quotas.
- **Youth & Children Ministries**: Youth fellowships, vacation Bible schools, and camps.
- **All-Night Prayer & Fasting**: Monthly overnight intercession gatherings.
- **Outreach & Charity Drives**: Community medical camps, food distribution drives, and village missions.

---

## 3. Public Registration Workflow

1. **Member / Guest Input**: The user views the event details page (`/events/[slug]`) and clicks "Register Now".
2. **Authentication Detection**:
   - If logged in, form auto-fills verified name, email, and phone number.
   - If guest, captures name, email, and phone number with lightweight guest registration.
3. **Capacity Check & Ticket Issuance**:
   - Server checks `remainingSeats > 0` inside an atomic transaction.
   - Generates digital pass with unique QR code.
   - Dispatches confirmation email and SMS with event reminder details.

---

## 4. Calendar Integration & Social Sharing

- **Add to Google Calendar**: Generates one-click `https://calendar.google.com/calendar/render?action=TEMPLATE...` deep links.
- **iCal / Outlook Download**: Generates standardized `.ics` calendar invitation files.
- **Social Sharing**: Direct WhatsApp and Facebook share buttons with pre-populated message copy and OpenGraph banner imagery.

---

## 5. Associated API Endpoints

- `GET /api/events` — Returns list of published events with category and branch query filters.
- `GET /api/events/upcoming` — Returns upcoming events ordered by date ascending.
- `GET /api/events/[id]` — Returns full event record and seat availability.
- `POST /api/events/[id]/register` — Submits attendee registration.

---

## 6. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Event not appearing on public `/events` page | Event `status` is set to `DRAFT` or `isPublished: false` | Publish event from Pastor / Event Manager portal. |
| Google Maps embed not loading | Missing or malformed `googleMapsUrl` in event record | Ensure venue coordinates or full Google Maps URL are formatted correctly in database. |

---

## Security Considerations
- Automated CAPTCHA / rate-limiting prevents bot spamming on public event registration endpoints.
- Event slugs are sanitized to prevent URL injection attacks.

## Related Documentation
- [Event-Manager.md](Event-Manager.md) — Operational event management.
- [Attendance.md](Attendance.md) — QR check-in and attendance recording.
- [SEO.md](SEO.md) — Event structured data schemas.
