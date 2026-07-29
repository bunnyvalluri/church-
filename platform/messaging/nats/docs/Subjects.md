# NATS Subject Taxonomy & Naming Conventions

## Subject Structure Hierarchy
Subject names follow strict dot-separated hierarchy:
`<domain>.<subdomain>.<entity>.<action>`

## Complete Subject Catalog

| Domain | Subject Pattern | Description |
| :--- | :--- | :--- |
| **Authentication** | `auth.events.login.success` | Successful user login |
| | `auth.events.login.failure` | Failed authentication attempt |
| | `auth.events.token.refreshed` | Auth token renewal |
| **Users** | `users.events.created` | New user profile created |
| | `users.events.updated` | User profile updated |
| **Members** | `members.events.registered` | New church member registration |
| | `members.events.baptized` | Member baptism milestone recorded |
| **Pastors** | `pastors.events.assigned` | Pastoral assignment update |
| | `pastors.events.counseling.scheduled` | Counseling session booked |
| **Prayer** | `prayer.events.requested` | New prayer request submitted |
| | `prayer.events.answered` | Prayer praise report logged |
| **Donations** | `donations.events.tithe.processed` | Tithe processing complete |
| | `donations.events.receipt.generated` | Tax receipt PDF generated |
| **Notifications** | `events.notifications.service.reminder` | Church service reminder broadcast |
| **Media Processing** | `media.processing.sermon.uploaded` | Video raw file uploaded |
| **Email Jobs** | `email.jobs.welcome.send` | Welcome email job |
| **SMS Jobs** | `sms.jobs.otp.send` | SMS 2FA code job |
| **Push Notifications**| `push.notifications.mobile.broadcast` | Mobile app push alert |
| **Audit Logs** | `audit.logs.security.violation` | Security audit violation log |
