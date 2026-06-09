
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "./sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Sidebar", () => {
  it("renders the sidebar with correct title", () => {
    render(<Sidebar />);
    expect(screen.getByText("SCIDAS")).toBeDefined();
  });

  it("renders navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Students")).toBeDefined();
    expect(screen.getByText("Attendance")).toBeDefined();
  });
});

