import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileBottomNav } from "./mobile-bottom-nav";

const mockUsePathname = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("MobileBottomNav", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("renders mobile primary routes from the shared navigation config", () => {
    render(<MobileBottomNav />);

    expect(screen.getByRole("link", { name: /หน้าหลัก/ })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: /นักเรียน/ })).toHaveAttribute(
      "href",
      "/students"
    );
    expect(screen.getByRole("link", { name: /แจ้งเตือน/ })).toHaveAttribute(
      "href",
      "/notifications"
    );
    expect(screen.getByRole("link", { name: /รายงาน/ })).toHaveAttribute(
      "href",
      "/reports"
    );
  });

  it("uses a Sheet trigger for the module menu instead of linking to /menu", () => {
    const { container } = render(<MobileBottomNav />);

    expect(screen.getByRole("button", { name: "เปิดเมนูทั้งหมด" })).toBeDefined();
    expect(container.querySelector('a[href="/menu"]')).toBeNull();
  });
});
