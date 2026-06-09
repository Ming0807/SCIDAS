
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
    expect(screen.getByPlaceholderText("Search students...")).toBeDefined();
  });

  it("renders the notifications button", () => {
    render(<Header />);
    expect(screen.getByText("Notifications")).toBeDefined();
  });
});

