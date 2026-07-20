/**
 * Navbar.tsx — Thin re-export wrapper
 *
 * The navigation system has been refactored into purpose-built components
 * under components/layout/nav/ for maintainability, performance, and
 * SaaS-quality responsive behavior.
 *
 * Components:
 *   NavigationBar     — root sticky shell + scroll state
 *   NavigationLogo    — logo + church name + tagline
 *   NavigationItem    — individual nav link
 *   DesktopMenu       — full nav for lg+ (1025px+)
 *   TabletMenu        — 4 items + More dropdown for sm-lg (541-1024px)
 *   MobileDrawer      — full-height slide-in drawer for <sm (<541px)
 *   MoreDropdown      — overflow menu for tablet
 *   NavigationActions — right cluster: branch + settings + login
 *   MemberLoginButton — gradient pill CTA
 *   TopInfoBar        — collapsible info bar (xl+)
 */
export { default } from "@/components/layout/nav/NavigationBar";
