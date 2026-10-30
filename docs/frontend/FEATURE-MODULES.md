# KCM Church — Modular Feature Architecture Specification

Each business feature is maintained independently under [`frontend/src/features/`](file:///C:/K.C.M-Portal/frontend/src/features) following the standard pattern:
`features/<module>/` containing `schemas.ts`, `services.ts`, `hooks.ts`, `components/`, and `index.ts`.

---

## 1. Catalog of Feature Modules

1. **`auth`**:
   * Services: `AuthService.login`, `AuthService.verifyGoogle`, `AuthService.register`, `AuthService.logout`.
   * Schemas: `loginSchema`, `registerSchema` (validated with Zod).
   * Components: `LoginForm`, `RegisterForm`.
2. **`events`**:
   * Services: `EventsService.getEvents`, `EventsService.registerForEvent`, `EventsService.checkInAttendee`.
   * Schemas: `eventRegistrationSchema`, `ChurchEvent`.
   * Components: `EventCard`.
3. **`donations`**:
   * Services: `DonationsService.createOrder`, `DonationsService.verifyPayment`, `DonationsService.getReceipt`.
   * Schemas: `donationFormSchema` with Indian Rupee bounds and 80G tax receipt PAN regex.
   * Components: `DonationForm` with Razorpay checkout integration.
4. **`sermons`**:
   * Services: `SermonsService.getSermons`, `SermonsService.logSermonView`.
   * Schemas: `SermonItem` with multilingual flags (`en`, `te`, `hi`).
   * Components: `SermonCard` with duration badge and audio/video trigger.
5. **`prayer-requests`**:
   * Services: `PrayerService.submitRequest`, `PrayerService.getPublicWall`.
   * Schemas: `prayerRequestSchema` with confidentiality toggle.
   * Components: `PrayerRequestForm`.
6. **`branches`**:
   * Services: `BranchesService.getBranches`, `BranchesService.getBranchBySlug`.
   * Data: Kukatpally, Banjara Hills, and Secunderabad campuses.
   * Components: `CampusSelector`.
7. **`attendance`**:
   * Services: `AttendanceService.checkInByQR`, `AttendanceService.getAttendanceStats`.
   * Components: `QRCheckInScanner` for event managers and field volunteers.
8. **`members`**:
   * Services: `MembersService.getMembers`, `MembersService.getMemberProfile`.
9. **`ngo`**:
   * Services: `NGOService.getProjects`, `NGOService.getOutreachStats`.
   * Components: `NGOProjectCard` with animated fundraising progress bar.
10. **`offline-sync`**:
    * Services: `OfflineSyncManager.enqueueMutation`, `OfflineSyncManager.synchronize`.
    * Components: `SyncStatusBadge` reflecting connectivity and pending sync counts.
11. **`volunteers`**:
    * Services: `VolunteersService.getDepartments`, `VolunteersService.applyForRole`.
12. **`finance`**:
    * Services: `FinanceService.getSummary`, `FinanceService.getTransactions`.
13. **`notifications`**:
    * Services: `NotificationsService.getNotifications`, `NotificationsService.registerFCMToken`.
14. **`media`**:
    * Services: `MediaService.getSignedUploadParams`, `MediaService.getGallery`.
15. **`groups`**:
    * Services: `GroupsService.getGroups`, `GroupsService.joinGroup`.
16. **`announcements`**:
    * Services: `AnnouncementsService.getActiveAnnouncements`.
17. **`reports`**:
    * Services: `ReportsService.getExecutiveMetrics`.
18. **`admin`**:
    * Services: `AdminService.getSystemDiagnostics`, `AdminService.getAuditLogs`.

