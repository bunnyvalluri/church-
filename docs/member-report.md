# Member Issue Reporting & Diagnostics User Guide

## Overview
The Member Issue Reporting system provides church members and staff with an intuitive, transparent, and secure mechanism to report bugs, accessibility issues, network anomalies, or general feedback encountered across the Kingdom of Christ Ministries platform.

---

## Member Guide (`/member/report`)

### Submitting a Report
1. **Navigate to Support**:
   - Access `/member/report` from any member portal page or by clicking **"Report Problem"** on any runtime error boundary.
2. **Select Issue Category**:
   - Pick from 9 defined categories (Something is Broken, Page Not Loading, Login & Account, Mobile Display, etc.).
3. **Select Severity**:
   - **Low**: Minor cosmetic or inconvenience.
   - **Medium**: Feature is usable with a simple workaround.
   - **High**: Core feature is blocked or inaccessible.
   - **Critical**: Entire portal or critical service is completely unusable.
4. **Describe the Problem**:
   - Provide a concise title and detailed steps to reproduce.
   - Optionally detail expected behavior vs. actual behavior.
5. **Attach Screenshot (Optional)**:
   - Upload PNG, JPG, or WebP up to 5MB.
6. **Transparent Diagnostic Disclosure**:
   - Click **"View Captured Data"** to see the real device and browser attributes automatically collected to assist engineers.
7. **Submit & Reference ID**:
   - Upon submission, a unique reference ID `KCM-ERR-XXXXXXXX` is generated immediately.

### Tracking Submitted Reports
- Switch to the **"My Submitted Reports"** tab at the top of `/member/report`.
- Review real-time status badges (`Received`, `Investigating`, `In Progress`, `Resolved`).
- Click any report to view a member-safe inspection modal.

### Direct Support Contact
For urgent pastoral or church account needs:
- **Phone**: `+91 9505288171`
- **Email**: `codewithrahul3@gmail.com`

---

## Administrator & Triage Guide (`/admin/support/reports`)

1. **Accessing the Console**:
   - Accessible to users with `ADMIN` or `SUPER_ADMIN` roles.
2. **Filtering & Searching**:
   - Filter by status, severity, category, or search by ticket ID, user email, or title.
3. **Inspecting Diagnostics**:
   - Click **"Inspect"** on any ticket row to view the full client environment (browser, OS, viewport, connection, screen resolution, timezone, URL, sanitized stack traces).
4. **Updating Status**:
   - Transition status between `OPEN`, `INVESTIGATING`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, and `DUPLICATE`.
   - Marking as `RESOLVED` timestamps the resolution and records the resolving administrator.
5. **Staff Assignment**:
   - Assign tickets to engineering or ministry staff members.
6. **Internal Investigation Notes**:
   - Add chronological internal notes to record findings, steps taken, or root cause analyses without leaking them to the member.
