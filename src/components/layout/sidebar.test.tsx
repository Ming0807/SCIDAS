
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./sidebar";

const mockUsePathname = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("renders the sidebar with correct title", () => {
    render(<Sidebar />);
    expect(screen.getByText("ระบบวิเคราะห์และดูแล")).toBeDefined();
    expect(screen.getByText("ช่วยเหลือนักเรียนรายบุคคล")).toBeDefined();
  });

  it("renders navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: /ภาพรวม/ })).toBeDefined();
    expect(screen.getByRole("link", { name: /นักเรียน/ })).toBeDefined();
    expect(screen.getByRole("link", { name: /การมาเรียน/ })).toBeDefined();
  });

  it("marks the active navigation item from the shared route matcher", () => {
    mockUsePathname.mockReturnValue("/attendance/daily");

    render(<Sidebar />);

    expect(screen.getByRole("link", { current: "page" })).toHaveAttribute(
      "href",
      "/attendance"
    );
  });

  it("uses role visibility from the shared navigation config", () => {
    render(<Sidebar role="student" />);

    expect(screen.getByRole("link", { name: /ภาพรวม/ })).toBeDefined();
    expect(screen.getByRole("link", { name: /ตั้งค่า/ })).toBeDefined();
    expect(screen.queryByRole("link", { name: /นักเรียน/ })).toBeNull();
  });
});

