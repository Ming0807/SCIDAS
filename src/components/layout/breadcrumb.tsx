
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || pathname === "/dashboard") return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors duration-200"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">หน้าหลัก</span>
      </Link>
      
      {segments.map((segment, index) => {
        // Skip dashboard if it is the first segment
        if (segment === "dashboard" && index === 0) return null;
        
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const formattedSegment = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {formattedSegment}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors duration-200"
              >
                {formattedSegment}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

