import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  Bell,
  BookMarked,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileText,
  HeartHandshake,
  Home,
  House,
  Settings,
  Smile,
  Users,
} from "lucide-react";

export type AppRole =
  | "admin"
  | "director"
  | "homeroom"
  | "counselor"
  | "teacher"
  | "student";

export type NavigationGroup = "core" | "care" | "insight" | "system";
export type NavigationPlacement = "sidebar" | "mobilePrimary" | "moduleMenu";

export type NavigationItem = {
  key: string;
  label: string;
  mobileLabel?: string;
  href: string;
  icon: LucideIcon;
  group: NavigationGroup;
  placements: NavigationPlacement[];
  studentVisible?: boolean;
};

export const dashboardNavItems: NavigationItem[] = [
  {
    key: "overview",
    label: "ภาพรวม",
    mobileLabel: "หน้าหลัก",
    href: "/",
    icon: Home,
    group: "core",
    placements: ["sidebar", "mobilePrimary", "moduleMenu"],
    studentVisible: true,
  },
  {
    key: "students",
    label: "นักเรียน",
    href: "/students",
    icon: Users,
    group: "core",
    placements: ["sidebar", "mobilePrimary", "moduleMenu"],
  },
  {
    key: "attendance",
    label: "การมาเรียน",
    href: "/attendance",
    icon: CalendarCheck,
    group: "core",
    placements: ["sidebar", "moduleMenu"],
  },
  {
    key: "academics",
    label: "ผลการเรียน",
    href: "/academics",
    icon: BookOpen,
    group: "core",
    placements: ["sidebar", "moduleMenu"],
  },
  {
    key: "behavior",
    label: "พฤติกรรม",
    href: "/behavior",
    icon: Smile,
    group: "care",
    placements: ["sidebar", "moduleMenu"],
  },
  {
    key: "home-visits",
    label: "เยี่ยมบ้าน",
    href: "/home-visits",
    icon: House,
    group: "care",
    placements: ["sidebar", "moduleMenu"],
  },
  {
    key: "support",
    label: "ดูแลช่วยเหลือ",
    href: "/support",
    icon: HeartHandshake,
    group: "care",
    placements: ["sidebar", "moduleMenu"],
  },
  {
    key: "risk-analysis",
    label: "วิเคราะห์ความเสี่ยง",
    href: "/risk-analysis",
    icon: BarChart2,
    group: "insight",
    placements: ["sidebar", "moduleMenu"],
  },
  {
    key: "development-plans",
    label: "แผนพัฒนารายบุคคล",
    mobileLabel: "แผนพัฒนา",
    href: "/development-plans",
    icon: ClipboardList,
    group: "care",
    placements: ["sidebar", "moduleMenu"],
  },
  {
    key: "notifications",
    label: "แจ้งเตือน",
    href: "/notifications",
    icon: Bell,
    group: "system",
    placements: ["mobilePrimary", "moduleMenu"],
  },
  {
    key: "reports",
    label: "รายงาน",
    href: "/reports",
    icon: FileText,
    group: "insight",
    placements: ["sidebar", "mobilePrimary", "moduleMenu"],
  },
  {
    key: "settings",
    label: "ตั้งค่า",
    href: "/settings",
    icon: Settings,
    group: "system",
    placements: ["sidebar", "moduleMenu"],
    studentVisible: true,
  },
];

export const studentNavItems = dashboardNavItems.filter(
  (item) => item.studentVisible,
);

export const mobilePrimaryNavItems = dashboardNavItems.filter(
  (item) => item.placements.includes("mobilePrimary"),
);

export const moduleNavItems = dashboardNavItems.filter(
  (item) => item.placements.includes("moduleMenu"),
);

export function getNavItemsForRole(role?: string | null) {
  return role === "student" ? studentNavItems : dashboardNavItems;
}

export function getSidebarNavigation(role?: string | null) {
  return getNavItemsForRole(role).filter((item) =>
    item.placements.includes("sidebar"),
  );
}

export function getMobilePrimaryNavigation() {
  return mobilePrimaryNavItems;
}

export function getModuleMenuNavigation() {
  return moduleNavItems;
}

function normalizePathname(pathname: string | null | undefined) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function isActivePath(pathname: string | null | undefined, href: string) {
  const currentPath = normalizePathname(pathname);
  const itemHref = normalizePathname(href);

  return currentPath === itemHref || (itemHref !== "/" && currentPath.startsWith(`${itemHref}/`));
}

export const isNavigationItemActive = isActivePath;

export function getActiveNavigationItem(pathname: string | null | undefined) {
  return [...dashboardNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isActivePath(pathname, item.href));
}

export function getNavigationLabel(href: string) {
  const currentPath = normalizePathname(href);

  return (
    exactPathLabels[currentPath] ??
    dynamicPathLabels.find(({ pattern }) => pattern.test(currentPath))?.label ??
    dashboardNavItems.find((item) => item.href === currentPath)?.label
  );
}

const exactPathLabels: Record<string, string> = {
  "/behavior/record": "บันทึกพฤติกรรม",
  "/home-visits/new": "บันทึกเยี่ยมบ้าน",
  "/support/new": "สร้างเคสดูแลช่วยเหลือ",
};

const dynamicPathLabels: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /^\/students\/[^/]+$/, label: "ข้อมูลนักเรียน" },
  { pattern: /^\/behavior\/[^/]+$/, label: "รายละเอียดพฤติกรรม" },
  { pattern: /^\/development-plans\/[^/]+$/, label: "รายละเอียดแผน" },
];

const segmentLabels: Record<string, string> = {
  new: "เพิ่มข้อมูล",
  record: "บันทึกข้อมูล",
};

export function getBreadcrumbItems(pathname: string) {
  const segments = normalizePathname(pathname).split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const navLabel = getNavigationLabel(href);
    const title =
      navLabel ??
      segmentLabels[segment] ??
      (index > 0 && /^[a-z0-9-]+$/i.test(segment) ? "รายละเอียด" : segment);

    return {
      href,
      label: title,
      title,
      isCurrent: index === segments.length - 1,
      isLast: index === segments.length - 1,
    };
  });
}

export { BookMarked };
