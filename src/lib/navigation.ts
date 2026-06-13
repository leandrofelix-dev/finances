import type { ComponentType } from "react";
import {
  AlertCircle,
  ArrowDownCircle,
  BadgeDollarSign,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Settings2,
  ShoppingBag,
  User,
  WalletCards,
} from "lucide-react";

export type DashboardTab =
  | "overview"
  | "cards"
  | "categories"
  | "incomes"
  | "fixed"
  | "transactions"
  | "installments"
  | "invoices"
  | "debts";

export type NavLinkItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

export const tabToHref: Record<DashboardTab, string> = {
  overview: "/",
  cards: "/cards",
  categories: "/categories",
  incomes: "/incomes",
  transactions: "/transactions",
  fixed: "/fixed",
  installments: "/installments",
  invoices: "/invoices",
  debts: "/debts",
};

export function hrefForTab(tab: DashboardTab) {
  return tabToHref[tab];
}

export function isLinkActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export const mainLinks: NavLinkItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projections", label: "Projeções", icon: BarChart3 },
];

export const incomeLinks: NavLinkItem[] = [{ href: "/incomes", label: "Entradas", icon: BadgeDollarSign }];

export const outcomeLinks: NavLinkItem[] = [
  { href: "/fixed", label: "Fixos", icon: WalletCards },
  { href: "/transactions", label: "Gastos", icon: ShoppingBag },
];

export const creditCardLinks: NavLinkItem[] = [
  { href: "/cards", label: "Cartões", icon: WalletCards },
  { href: "/invoices", label: "Faturas", icon: CreditCard },
  { href: "/installments", label: "Parcelamentos", icon: ShoppingBag },
];

export const managementLinks: NavLinkItem[] = [
  { href: "/categories", label: "Categorias", icon: Settings2 },
  { href: "/profile", label: "Perfil", icon: User },
];

export const dockPrimaryLinks: NavLinkItem[] = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/transactions", label: "Gastos", icon: ShoppingBag },
  { href: "/cards", label: "Cartões", icon: CreditCard },
  { href: "/projections", label: "Projeções", icon: BarChart3 },
  { href: "/profile", label: "Perfil", icon: User },
];

export const dockMoreLinks: NavLinkItem[] = [
  ...incomeLinks,
  ...outcomeLinks.filter((link) => link.href !== "/transactions"),
  ...creditCardLinks.filter((link) => link.href !== "/cards"),
  { href: "/categories", label: "Categorias", icon: Settings2 },
  { href: "/debts", label: "Dívidas", icon: AlertCircle },
];

export const navSections = {
  outcome: {
    id: "outcome",
    label: "Saídas",
    icon: ArrowDownCircle,
    links: outcomeLinks,
  },
  creditCards: {
    id: "creditCards",
    label: "Cartões de crédito",
    icon: CreditCard,
    links: creditCardLinks,
  },
} as const;
