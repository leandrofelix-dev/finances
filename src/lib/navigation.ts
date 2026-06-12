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

export const tabToHref: Record<DashboardTab, string> = {
  overview: "/",
  cards: "/cards",
  categories: "/categories",
  incomes: "/incomes",
  transactions: "/transactions",
  fixed: "/fixed",
  installments: "/installments",
  invoices: "/invoices",
  debts: "/transactions",
};

export function hrefForTab(tab: DashboardTab) {
  return tabToHref[tab];
}
