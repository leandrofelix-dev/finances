"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowDownCircle,
  BadgeDollarSign,
  BarChart3,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Leaf,
  Settings2,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/atoms/sheet";
import { useMobileNav } from "@/context/MobileNavContext";
import { cn } from "@/lib/utils";

const mainLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projections", label: "Projeções", icon: BarChart3 },
];

const incomeLinks = [{ href: "/incomes", label: "Entradas", icon: BadgeDollarSign }];

const outcomeLinks = [
  { href: "/fixed", label: "Fixos", icon: WalletCards },
  { href: "/transactions", label: "Gastos", icon: ShoppingBag },
];

const creditCardLinks = [
  { href: "/cards", label: "Cartões", icon: WalletCards },
  { href: "/invoices", label: "Faturas", icon: CreditCard },
  { href: "/installments", label: "Parcelamentos", icon: ShoppingBag },
];

const managementLinks = [
  { href: "/categories", label: "Categorias", icon: Settings2 },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  onNavigate,
  pathname,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  onNavigate?: () => void;
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
      onClick={onNavigate}
    >
      <Icon size={17} />
      <span>{label}</span>
    </Link>
  );
}

function SectionLink({
  href,
  label,
  icon: Icon,
  onNavigate,
  pathname,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  onNavigate?: () => void;
  pathname: string;
}) {
  return <NavLink href={href} icon={Icon} label={label} onNavigate={onNavigate} pathname={pathname} />;
}

function NavSection({
  id,
  label,
  icon: Icon,
  links,
  onNavigate,
  pathname,
  open,
  onToggle,
}: {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  links: Array<{ href: string; label: string; icon: ComponentType<{ size?: number }> }>;
  onNavigate?: () => void;
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
            <SectionLink key={link.href} {...link} onNavigate={onNavigate} pathname={pathname} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    creditCards: true,
    outcome: true,
  });

  function toggleSection(id: string) {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
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
            <NavLink key={link.href} {...link} onNavigate={onNavigate} pathname={pathname} />
          ))}
        </div>

        <NavLink {...incomeLinks[0]} onNavigate={onNavigate} pathname={pathname} />

        <NavSection
          icon={ArrowDownCircle}
          id="outcome"
          label="Saídas"
          links={outcomeLinks}
          onNavigate={onNavigate}
          onToggle={toggleSection}
          open={openSections.outcome}
          pathname={pathname}
        />

        <NavSection
          icon={CreditCard}
          id="creditCards"
          label="Cartões de crédito"
          links={creditCardLinks}
          onNavigate={onNavigate}
          onToggle={toggleSection}
          open={openSections.creditCards}
          pathname={pathname}
        />

        {managementLinks.map((link) => (
          <NavLink key={link.href} {...link} onNavigate={onNavigate} pathname={pathname} />
        ))}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen: isMobileOpen, close: closeMobileNav } = useMobileNav();

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  return (
    <>
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-2xl border border-border bg-card shadow-sm md:block">
        <SidebarContent onNavigate={closeMobileNav} pathname={pathname} />
      </aside>

      <Sheet onOpenChange={(open) => (!open ? closeMobileNav() : undefined)} open={isMobileOpen}>
        <SheetContent className="w-[min(18rem,calc(100vw-1rem))] p-0 md:hidden" side="left" showCloseButton>
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle className="sr-only">Navegação principal</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavigate={closeMobileNav} pathname={pathname} />
        </SheetContent>
      </Sheet>
    </>
  );
}
