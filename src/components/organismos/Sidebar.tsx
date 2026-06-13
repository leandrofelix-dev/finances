"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Leaf } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import {
  incomeLinks,
  isLinkActive,
  mainLinks,
  managementLinks,
  navSections,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  pathname: string;
}) {
  const isActive = isLinkActive(pathname, href);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      href={href}
    >
      <Icon size={17} />
      <span>{label}</span>
    </Link>
  );
}

function NavSection({
  id,
  label,
  icon: Icon,
  links,
  pathname,
  open,
  onToggle,
}: {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  links: Array<{ href: string; label: string; icon: ComponentType<{ size?: number }> }>;
  pathname: string;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  const hasActiveLink = links.some((link) => isLinkActive(pathname, link.href));

  return (
    <div className="grid gap-1">
      <Button
        className={cn("w-full justify-between px-3", hasActiveLink && "bg-muted text-foreground")}
        onClick={() => onToggle(id)}
        type="button"
        variant="secondary"
      >
        <span className="flex items-center gap-2">
          <Icon size={15} />
          {label}
        </span>
        <ChevronDown className={cn("transition-transform", open && "rotate-180")} size={15} />
      </Button>
      {open ? (
        <div className="ml-3 grid gap-1 border-l border-border pl-3">
          {links.map((link) => (
            <NavLink key={link.href} {...link} pathname={pathname} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    creditCards: true,
    outcome: true,
  });

  function toggleSection(id: string) {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-2xl border border-border bg-card shadow-sm md:block">
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Leaf size={18} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-foreground">Finanças</div>
            <div className="text-xs text-muted-foreground">Conta pessoal</div>
          </div>
        </div>

        <nav className="grid gap-2 overflow-y-auto pr-1" aria-label="Navegação principal">
          <div className="grid gap-1">
            {mainLinks.map((link) => (
              <NavLink key={link.href} {...link} pathname={pathname} />
            ))}
          </div>

          <NavLink {...incomeLinks[0]} pathname={pathname} />

          <NavSection
            {...navSections.outcome}
            onToggle={toggleSection}
            open={openSections.outcome}
            pathname={pathname}
          />

          <NavSection
            {...navSections.creditCards}
            onToggle={toggleSection}
            open={openSections.creditCards}
            pathname={pathname}
          />

          {managementLinks.map((link) => (
            <NavLink key={link.href} {...link} pathname={pathname} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
