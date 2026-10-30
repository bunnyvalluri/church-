# Kingdom of Christ Ministries (KCM Church) — Route Inventory & Map

This document catalogues all 148 active application routes across public outreach and authenticated portals.

---

## 1. Public Outreach Routes
| Route | Method | Access | Purpose |
|---|---|---|---|
| `/` | `GET` | Public | Church home page, hero video, gospel message, quick links |
| `/about` | `GET` | Public | History, doctrinal statements, pastoral vision |
| `/about/leadership` | `GET` | Public | Pastoral staff, elders, and trustees |
| `/about/beliefs` | `GET` | Public | Apostles' Creed, Statement of Faith |
| `/about/ministries` | `GET` | Public | Men's, Women's, Youth, and Children's ministries |
| `/sermons` | `GET` | Public | Searchable sermon archive with video/audio streaming |
| `/events` | `GET` | Public | Church calendar, conferences, and seat reservations |
| `/prayer` | `GET` | Public | Public prayer wall and pastoral petition submission form |
| `/locations` | `GET` | Public | 3 Hyderabad campuses (Kukatpally, Banjara Hills, Secunderabad) |
| `/give` / `/donations` | `GET` | Public | Online tithes, offerings, building fund with 80G tax receipt |
| `/ngo` | `GET` | Public | NGO outreach, community feeding, education camps |
| `/ngo/projects` | `GET` | Public | Active charitable initiatives and fund progress |
| `/gallery` | `GET` | Public | Church event photographs and media highlights |
| `/contact` | `GET` | Public | Campus contact details, map navigation, inquiry form |
| `/privacy` | `GET` | Public | Data protection & privacy policy |
| `/terms` | `GET` | Public | Terms of service and church code of conduct |

---

## 2. Authentication & Session Gateways
| Route | Access | Role Target | Behavior |
|---|---|---|---|
| `/login` | Public | All | Universal sign-in (email/password & Google GIS) |
| `/register` | Public | Member | New believer / member onboarding |
| `/forgot-password` | Public | All | Password reset request with secure token link |
| `/portal-select` | Authenticated | Multi-Role | Role gateway directing users to their portal |

---

## 3. Authenticated Church Portals (Edge RBAC Protected)
| Portal Prefix | Authorized Roles | Key Pages & Features |
|---|---|---|
| `/member/*` | `MEMBER`, `PASTOR`, `ADMIN` | Profile, My Giving History, Registered Events, Prayer Requests |
| `/pastor/*` | `PASTOR`, `ADMIN`, `SUPER_ADMIN` | Pastoral Dashboard, Prayer Care, Member Visits, Sermon Planning |
| `/admin/*` | `ADMIN`, `SUPER_ADMIN` | System Diagnostics, Finance Ledger, User Roles, Audit Logs |
| `/event-manager/*` | `EVENT_MANAGER`, `ADMIN` | Check-In Scanner, QR Validation, Capacity Management |
| `/field-volunteer/*` | `FIELD_VOLUNTEER`, `ADMIN` | Attendance Recording, Offline Mutation Queue, Rosters |

---

## 4. Robots & SEO Directives
* **Indexed**: All public outreach routes (`/`, `/about`, `/sermons`, `/events`, `/prayer`, `/locations`, `/give`, `/ngo`).
* **Disallowed (No-Index)**: All portal paths (`/admin/*`, `/member/*`, `/pastor/*`, `/event-manager/*`, `/portal-select`), authentication flows (`/login`, `/register`, `/forgot-password`), and internal API endpoints (`/api/*`).

