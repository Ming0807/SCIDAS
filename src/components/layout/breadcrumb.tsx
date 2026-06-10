
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import React from "react";
import { getBreadcrumbItems } from "@/lib/navigation";

export function Breadcrumb() {
  const pathname = usePathname();
  const items = getBreadcrumbItems(pathname);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors duration-200"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">หน้าหลัก</span>
      </Link>
      
      {items.map((item) => {
        return (
          <React.Fragment key={item.href}>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {item.isCurrent ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

