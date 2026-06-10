
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "./header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/students",
}));

describe("Header", () => {
  it("renders the search input", () => {
    render(<Header />);
    expect(screen.getByPlaceholderText("ค้นหานักเรียน, เลขประจำตัว, หรืออื่นๆ")).toBeDefined();
  });

  it("renders the notifications button", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: /การแจ้งเตือน/ })).toBeDefined();
  });
});

