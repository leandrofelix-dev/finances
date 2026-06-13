"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/atoms/sheet";
import { dockMoreLinks, dockPrimaryLinks, isLinkActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function DockLink({
  href,
  label,
  icon: Icon,
  isActive,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[0.68rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
      href={href}
      onClick={onNavigate}
    >
      <Icon className={cn("shrink-0", isActive && "text-primary")} size={20} />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}

export function BottomDock() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = dockMoreLinks.some((link) => isLinkActive(pathname, link.href));

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
          {dockPrimaryLinks.map((link) => (
            <DockLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              isActive={isLinkActive(pathname, link.href)}
              label={link.label}
            />
          ))}

          <button
            aria-current={isMoreActive ? "page" : undefined}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[0.68rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isMoreActive || moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setMoreOpen(true)}
            type="button"
          >
            <MoreHorizontal className={cn("shrink-0", (isMoreActive || moreOpen) && "text-primary")} size={20} />
            <span className="max-w-full truncate">Mais</span>
          </button>
        </div>
      </nav>

      <Sheet onOpenChange={setMoreOpen} open={moreOpen}>
        <SheetContent className="pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden" side="bottom" showCloseButton>
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle>Mais opções</SheetTitle>
          </SheetHeader>
          <div className="grid gap-1 py-4">
            {dockMoreLinks.map((link) => {
              const active = isLinkActive(pathname, link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted"
                  )}
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
