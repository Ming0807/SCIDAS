import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "./breadcrumb";

const mockUsePathname = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("Breadcrumb", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("does not render on the dashboard root", () => {
    const { container } = render(<Breadcrumb />);

    expect(container).toBeEmptyDOMElement();
  });

  it("uses configured labels for exact child routes", () => {
    mockUsePathname.mockReturnValue("/support/new");

    render(<Breadcrumb />);

    expect(screen.getByRole("link", { name: "ดูแลช่วยเหลือ" })).toHaveAttribute(
      "href",
      "/support"
    );
    expect(screen.getByText("สร้างเคสดูแลช่วยเหลือ")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("uses configured labels for dynamic detail routes", () => {
    mockUsePathname.mockReturnValue("/students/123");

    render(<Breadcrumb />);

    expect(screen.getByRole("link", { name: "นักเรียน" })).toHaveAttribute(
      "href",
      "/students"
    );
    expect(screen.getByText("ข้อมูลนักเรียน")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
