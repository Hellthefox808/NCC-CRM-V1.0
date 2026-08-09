import React from "react";
import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { useLocation } from "@backend/lib/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@frontend/components/ui/breadcrumb";

/** Human labels for the app's real routes (kept in sync with src/routes). */
const SEGMENT_LABELS: Record<string, string> = {
  enroll: "Enrollment Application",
  notices: "Unit Notices",
  login: "Portal Sign In",
  admin: "Officer Portal",
  cadet: "Cadet Dashboard",
};

function labelFor(segment: string) {
  return (
    SEGMENT_LABELS[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // Home needs no breadcrumb trail — it is the root of the hierarchy.
  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full border-b border-border bg-secondary/40">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-3 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList className="text-xs sm:text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/"
                  className="flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Home className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-foreground">
                        {labelFor(segment)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          to={href}
                          className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {labelFor(segment)}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </nav>
  );
}
