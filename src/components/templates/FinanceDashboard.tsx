"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  Hash,
  HeartPulse,
  House,
  Landmark,
  ListChecks,
  Percent,
  PiggyBank,
  Plane,
  ReceiptText,
  Repeat,
  Shirt,
  ShoppingCart,
  Smartphone,
  Tag,
  Timer,
  TrendingDown,
  Type,
  Utensils,
  WalletCards,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/Button";
import { AdvisorPanel } from "@/components/organismos/dashboard/AdvisorPanel";
import { BalanceHero } from "@/components/organismos/dashboard/BalanceHero";
import { CashflowChart, type CashflowPoint } from "@/components/organismos/dashboard/CashflowChart";
import { CategoryDonut } from "@/components/organismos/dashboard/CategoryDonut";
import { computeFinanceScore, FinanceScore } from "@/components/organismos/dashboard/FinanceScore";
import { MetricCards } from "@/components/organismos/dashboard/MetricCards";
import { RecentTransactionsTable } from "@/components/organismos/dashboard/RecentTransactionsTable";
import { dismissToast, notify } from "@/components/organismos/AppToast";
import { CrudPanel } from "@/components/moleculas/CrudPanel";
import { FormScreen } from "@/components/moleculas/FormScreen";
import { Modal } from "@/components/moleculas/Modal";
import { TableActions as Actions } from "@/components/moleculas/TableActions";
import { ColorPicker } from "@/components/moleculas/ColorPicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import {
  Field,
  FieldGroup,
  Form,
  FormActions,
  MoneyInput,
  PercentInput,
  StyledInput,
  StyledSelect,
} from "@/components/moleculas/FormControls";
import dashboardStyles from "@/components/organismos/dashboard/dashboard.module.css";
import { useDashboardNavigation } from "@/context/DashboardNavigationContext";
import { recurrenceLabel } from "@/lib/income";
import { hrefForTab, type DashboardTab } from "@/lib/navigation";
import styles from "./FinanceDashboard.module.css";

type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  allocationPercentage?: number | null;
  maxLimit?: number | null;
};

type Card = {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
};

type Income = {
  id: string;
  description: string;
  amount: number;
  isRecurring: boolean;
  recurrenceType?: "NONE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
  recurrenceDay?: number | null;
  recurrenceMonth?: number | null;
  recurrenceCount?: number | null;
  date: string;
  endDate?: string | null;
};

type FixedExpense = {
  id: string;
  description: string;
  amount: number;
  variationMargin: number;
  dueDay: number;
  recurrenceType?: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";
  recurrenceDay?: number | null;
  recurrenceMonth?: number | null;
  categoryId: string;
  category: Category;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  payments?: Array<{
    id: string;
    isPaid: boolean;
    month: number;
    year: number;
    paidAt?: string | null;
  }>;
};

type Installment = {
  id: string;
  description: string;
  totalAmount: number;
  totalInstallments: number;
  currentInstallment: number;
  amountPerInstallment: number;
  startDate: string;
  cardId: string;
  card: Card;
  categoryId: string;
  category: Category;
};

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "INFLOW" | "OUTFLOW";
  date: string;
  categoryId?: string | null;
  category?: Category | null;
  cardId?: string | null;
  card?: Card | null;
};

type Debt = {
  id: string;
  description: string;
  amount: number;
  isRecurring: boolean;
  date: string;
  dueDay?: number | null;
  categoryId?: string | null;
  category?: Category | null;
  endDate?: string | null;
  isPaid: boolean;
};

type Invoice = {
  id: string;
  cardId: string;
  month: number;
  year: number;
  realAmount: number;
  status: "ABERTA" | "FECHADA" | "PAGA";
  card: Card;
};

type CategoryAllocation = {
  id: string;
  name: string;
  color: string;
  target: number;
  spent: number;
  committed: number;
  remaining: number | null;
  dailyAllowance: number | null;
  usage: number;
};

type Advice = {
  daysRemaining: number;
  healthyDailySpend: number;
  totals: {
    spendableIncome: number;
    fixedProjected: number;
    installmentProjected: number;
    debtProjected: number;
    outflowToDate: number;
    balanceNow: number;
    projectedMonthEnd: number;
  };
  categoryAllocations: CategoryAllocation[];
  monthlyCashflow?: CashflowPoint[];
};

type Tab =
  | "overview"
  | "cards"
  | "categories"
  | "incomes"
  | "fixed"
  | "transactions"
  | "installments"
  | "invoices"
  | "debts";

type Editing = {
  resource: CrudResource;
  id: string;
  item: Record<string, unknown>;
} | null;

type CrudResource = Exclude<Tab, "overview">;

type ResourceFilters = {
  q: string;
  categoryId: string;
  cardId: string;
  type: string;
  status: string;
  active: string;
};

const emptyResourceFilters: ResourceFilters = {
  q: "",
  categoryId: "",
  cardId: "",
  type: "",
  status: "",
  active: "",
};

type DataState = {
  advice: Advice | null;
  cards: Card[];
  categories: Category[];
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  installments: Installment[];
  transactions: Transaction[];
  debts: Debt[];
  invoices: Invoice[];
};

const emptyData: DataState = {
  advice: null,
  cards: [],
  categories: [],
  incomes: [],
  fixedExpenses: [],
  installments: [],
  transactions: [],
  debts: [],
  invoices: [],
};

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Resumo" },
  { id: "cards", label: "Cartões" },
  { id: "categories", label: "Categorias" },
  { id: "incomes", label: "Entradas" },
  { id: "transactions", label: "Gastos" },
  { id: "fixed", label: "Fixos" },
  { id: "installments", label: "Parcelamentos" },
  { id: "invoices", label: "Faturas (cartões)" },
  { id: "debts", label: "Gastos" },
];

const hashToTab: Record<string, Tab> = {
  "#cartoes": "cards",
  "#categorias": "categories",
  "#receitas": "incomes",
  "#compras": "transactions",
  "#despesas": "fixed",
  "#parcelamentos": "installments",
  "#faturas": "invoices",
  "#dividas": "debts",
};

const endpoints: Record<Exclude<Tab, "overview">, string> = {
  cards: "/api/cards",
  categories: "/api/categories",
  incomes: "/api/incomes",
  fixed: "/api/expenses/fixed",
  transactions: "/api/transactions",
  installments: "/api/expenses/installments",
  invoices: "/api/invoices",
  debts: "/api/debts",
};

function visibleTabFor(tab: Tab): Tab {
  return tab === "debts" ? "transactions" : tab;
}

function matchesTextQuery(query: string, values: Array<string | number | boolean | null | undefined>) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return values
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery));
}

function matchesSelectFilter(selected: string, value: string) {
  return !selected || selected === value;
}

const categoryIconOptions: Array<{ name: string; label: string; icon: LucideIcon }> = [
  { name: "CircleDollarSign", label: "Dinheiro", icon: CircleDollarSign },
  { name: "ShoppingCart", label: "Mercado", icon: ShoppingCart },
  { name: "Utensils", label: "Comida", icon: Utensils },
  { name: "House", label: "Casa", icon: House },
  { name: "Car", label: "Carro", icon: Car },
  { name: "HeartPulse", label: "Saúde", icon: HeartPulse },
  { name: "GraduationCap", label: "Estudos", icon: GraduationCap },
  { name: "Gamepad2", label: "Lazer", icon: Gamepad2 },
  { name: "Plane", label: "Viagem", icon: Plane },
  { name: "Shirt", label: "Roupas", icon: Shirt },
  { name: "Dumbbell", label: "Fitness", icon: Dumbbell },
  { name: "PiggyBank", label: "Reserva", icon: PiggyBank },
  { name: "Landmark", label: "Banco", icon: Landmark },
  { name: "CreditCard", label: "Cartão", icon: CreditCard },
  { name: "Smartphone", label: "Serviços", icon: Smartphone },
  { name: "Zap", label: "Contas", icon: Zap },
  { name: "Gift", label: "Presentes", icon: Gift },
  { name: "Tag", label: "Outros", icon: Tag },
];

const categoryColorOptions = [
  "#10b981",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#64748b",
  "#111827",
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function formToObject(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries());
}

function dateInput(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function dateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "-";
}

function invoiceDueDate(invoice: Invoice) {
  const monthIndex = invoice.month - 1;
  const lastDayOfMonth = new Date(invoice.year, invoice.month, 0).getDate();
  const dueDay = Math.min(invoice.card.dueDay, lastDayOfMonth);

  return new Date(invoice.year, monthIndex, dueDay, 12, 0, 0, 0);
}

function asRecord(item: unknown): Record<string, unknown> {
  return item && typeof item === "object" ? (item as Record<string, unknown>) : {};
}

function text(item: Record<string, unknown>, key: string, fallback = "") {
  const value = item[key];
  return value === null || value === undefined ? fallback : String(value);
}

function numberText(item: Record<string, unknown>, key: string, fallback = "") {
  const value = item[key];
  return typeof value === "number" ? String(value) : text(item, key, fallback);
}

function booleanText(item: Record<string, unknown>, key: string, fallback = "false") {
  const value = item[key];
  if (typeof value === "boolean") return String(value);
  return text(item, key, fallback);
}

export function FinanceDashboard({ initialTab = "overview" }: { initialTab?: Tab }) {
  const router = useRouter();
  const navigation = useDashboardNavigation();
  const [activeTab, setActiveTab] = useState<Tab>(() => visibleTabFor(initialTab));
  const [data, setData] = useState<DataState>(emptyData);
  const [editing, setEditing] = useState<Editing>(null);
  const [creating, setCreating] = useState<CrudResource | null>(null);
  const [filters, setFilters] = useState<Partial<Record<CrudResource, ResourceFilters>>>({});
  const [invoiceMonth, setInvoiceMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [, setLoading] = useState(true);

  const navigateToTab = useCallback((tab: DashboardTab) => {
    const visibleTab = visibleTabFor(tab);
    setActiveTab(visibleTab);
    setEditing(null);
    setCreating(null);
    router.push(hrefForTab(visibleTab));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router]);

  const scrollToCashflow = useCallback(() => {
    navigateToTab("overview");
    window.setTimeout(() => {
      document.getElementById("cashflow-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, [navigateToTab]);

  useEffect(() => {
    navigation?.setNavigateHandler(navigateToTab);
    return () => navigation?.setNavigateHandler(null);
  }, [navigation, navigateToTab]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [
      adviceResponse,
      cardsResponse,
      categoriesResponse,
      incomesResponse,
      fixedResponse,
      installmentsResponse,
      transactionsResponse,
      debtsResponse,
      invoicesResponse,
    ] = await Promise.all([
      fetch("/api/financial-advice"),
      fetch("/api/cards"),
      fetch("/api/categories"),
      fetch("/api/incomes"),
      fetch("/api/expenses/fixed"),
      fetch("/api/expenses/installments"),
      fetch("/api/transactions"),
      fetch("/api/debts"),
      fetch("/api/invoices"),
    ]);

    const responses = [
      adviceResponse,
      cardsResponse,
      categoriesResponse,
      incomesResponse,
      fixedResponse,
      installmentsResponse,
      transactionsResponse,
      debtsResponse,
      invoicesResponse,
    ];

    if (responses.some((response) => !response.ok)) {
      throw new Error("Falha ao carregar dados");
    }

    setData({
      advice: await adviceResponse.json(),
      cards: await cardsResponse.json(),
      categories: await categoriesResponse.json(),
      incomes: await incomesResponse.json(),
      fixedExpenses: await fixedResponse.json(),
      installments: await installmentsResponse.json(),
      transactions: await transactionsResponse.json(),
      debts: await debtsResponse.json(),
      invoices: await invoicesResponse.json(),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    // Client-side bootstrap fetch for the whole workspace.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().catch(() => {
      notify({
        description: "Rode npm run db:setup e recarregue a página.",
        title: "Não foi possível carregar os dados",
        type: "error",
      });
      setLoading(false);
    });
  }, [loadData]);

  useEffect(() => {
    function syncTabFromHash() {
      const tab = hashToTab[window.location.hash];
      if (tab) {
        setActiveTab(visibleTabFor(tab));
        setEditing(null);
        setCreating(null);
      }
    }

    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  async function submit(resource: Exclude<Tab, "overview">, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const toastId = "finance-submit";
    notify({
      id: toastId,
      title: editing?.resource === resource ? "Atualizando registro..." : "Salvando registro...",
      type: "loading",
    });

    const form = event.currentTarget;
    const payload = formToObject(form);
    const isEditing = editing?.resource === resource;
    const endpoint = isEditing ? `${endpoints[resource]}/${editing.id}` : endpoints[resource];

    const response = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      notify({
        description: "Revise os campos obrigatórios e tente novamente.",
        id: toastId,
        title: "Não foi possível salvar",
        type: "error",
      });
      return;
    }

    form.reset();
    setEditing(null);
    setCreating(null);
    await loadData();
    notify({
      id: toastId,
      title: isEditing ? "Registro atualizado" : "Registro cadastrado",
      type: "success",
    });
  }

  async function remove(resource: Exclude<Tab, "overview">, id: string) {
    if (!window.confirm("Excluir este registro?")) return;

    const toastId = "finance-delete";
    notify({ id: toastId, title: "Excluindo registro...", type: "loading" });
    const response = await fetch(`${endpoints[resource]}/${id}`, { method: "DELETE" });

    if (!response.ok) {
      notify({
        description: "Verifique se há vínculos com outros registros.",
        id: toastId,
        title: "Não foi possível excluir",
        type: "error",
      });
      return;
    }

    if (editing?.id === id) setEditing(null);
    await loadData();
    dismissToast(toastId);
    notify({ title: "Registro excluído", type: "success" });
  }

  async function toggleFixedExpensePayment(expense: FixedExpense) {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const currentPayment = expense.payments?.find(
      (payment) => payment.month === month && payment.year === year
    );
    const nextIsPaid = !currentPayment?.isPaid;
    const toastId = `fixed-payment-${expense.id}`;

    notify({
      id: toastId,
      title: nextIsPaid ? "Marcando gasto como pago..." : "Marcando gasto como pendente...",
      type: "loading",
    });

    const response = await fetch(`/api/expenses/fixed/${expense.id}/payments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: nextIsPaid, month, year }),
    });

    if (!response.ok) {
      notify({
        id: toastId,
        title: "Não foi possível atualizar o pagamento",
        type: "error",
      });
      return;
    }

    await loadData();
    notify({
      id: toastId,
      title: nextIsPaid ? "Gasto marcado como pago" : "Gasto marcado como pendente",
      type: "success",
    });
  }

  function edit(resource: Tab, item: Record<string, unknown>) {
    if (resource === "overview") return;

    setCreating(null);
    setEditing({ resource, id: String(item.id), item });
  }

  function create(resource: CrudResource) {
    setEditing(null);
    setCreating(resource);
  }

  function closeForm() {
    setEditing(null);
    setCreating(null);
  }

  function resourceFilters(resource: CrudResource) {
    return filters[resource] ?? emptyResourceFilters;
  }

  function updateFilters(resource: CrudResource, patch: Partial<ResourceFilters>) {
    setFilters((current) => ({
      ...current,
      [resource]: { ...resourceFilters(resource), ...patch },
    }));
  }

  function clearFilters(resource: CrudResource) {
    setFilters((current) => ({ ...current, [resource]: emptyResourceFilters }));
  }

  const totals = data.advice?.totals;
  const financeScore = useMemo(
    () =>
      computeFinanceScore(
        data.advice?.categoryAllocations.map((category) => category.usage) ?? [],
        totals?.balanceNow ?? 0
      ),
    [data.advice?.categoryAllocations, totals?.balanceNow]
  );

  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "Dashboard";
  const activeFormResource = editing?.resource ?? creating;
  const shouldShowFormScreen = Boolean(activeFormResource);

  const cardsFilter = resourceFilters("cards");
  const categoriesFilter = resourceFilters("categories");
  const incomesFilter = resourceFilters("incomes");
  const transactionsFilter = resourceFilters("transactions");
  const fixedFilter = resourceFilters("fixed");
  const installmentsFilter = resourceFilters("installments");
  const invoicesFilter = resourceFilters("invoices");
  const debtsFilter = resourceFilters("debts");

  const filteredCards = data.cards.filter((card) =>
    matchesTextQuery(cardsFilter.q, [card.name, card.limit, card.closingDay, card.dueDay])
  );
  const filteredCategories = data.categories.filter((category) =>
    matchesTextQuery(categoriesFilter.q, [category.name, category.allocationPercentage, category.maxLimit])
  );
  const filteredIncomes = data.incomes.filter((income) => {
    const recurrence = income.isRecurring ? income.recurrenceType ?? "MONTHLY" : "NONE";
    return (
      matchesTextQuery(incomesFilter.q, [
        income.description,
        income.amount,
        income.isRecurring ? "recorrente" : "isolada",
        income.recurrenceType,
        dateLabel(income.date),
      ]) && matchesSelectFilter(incomesFilter.type, recurrence)
    );
  });
  const filteredTransactions = data.transactions.filter((transaction) =>
    matchesTextQuery(transactionsFilter.q, [
      transaction.description,
      transaction.amount,
      transaction.type === "INFLOW" ? "entrada" : "saída",
      transaction.category?.name,
      transaction.card?.name,
      dateLabel(transaction.date),
    ]) &&
    matchesSelectFilter(transactionsFilter.type, transaction.type) &&
    matchesSelectFilter(transactionsFilter.categoryId, transaction.categoryId ?? "") &&
    matchesSelectFilter(transactionsFilter.cardId, transaction.cardId ?? "")
  );
  const filteredFixedExpenses = data.fixedExpenses.filter((expense) =>
    matchesTextQuery(fixedFilter.q, [
      expense.description,
      expense.amount,
      expense.variationMargin,
      expense.category.name,
      expense.isActive ? "ativa" : "inativa",
    ]) &&
    matchesSelectFilter(fixedFilter.categoryId, expense.categoryId) &&
    matchesSelectFilter(fixedFilter.active, expense.isActive ? "true" : "false")
  );
  const filteredInstallments = data.installments.filter((installment) =>
    matchesTextQuery(installmentsFilter.q, [
      installment.description,
      installment.totalAmount,
      installment.amountPerInstallment,
      installment.card.name,
      installment.category.name,
      `${installment.currentInstallment}/${installment.totalInstallments}`,
    ]) &&
    matchesSelectFilter(installmentsFilter.cardId, installment.cardId) &&
    matchesSelectFilter(installmentsFilter.categoryId, installment.categoryId)
  );
  const filteredInvoices = data.invoices.filter((invoice) =>
    matchesTextQuery(invoicesFilter.q, [
      invoice.card.name,
      invoice.month,
      invoice.year,
      invoice.status,
      invoice.realAmount,
      `${String(invoice.month).padStart(2, "0")}/${invoice.year}`,
    ]) &&
    matchesSelectFilter(invoicesFilter.cardId, invoice.cardId) &&
    matchesSelectFilter(invoicesFilter.status, invoice.status)
  );
  const timelineInvoices = filteredInvoices
    .filter(
      (invoice) =>
        invoice.month === invoiceMonth.getMonth() + 1 &&
        invoice.year === invoiceMonth.getFullYear()
    )
    .sort((a, b) => invoiceDueDate(a).getTime() - invoiceDueDate(b).getTime());
  const filteredDebts = data.debts.filter((debt) =>
    matchesTextQuery(debtsFilter.q, [
      debt.description,
      debt.amount,
      debt.category?.name,
      debt.isRecurring ? "recorrente" : "isolada",
      debt.isPaid ? "paga" : "pendente",
      dateLabel(debt.date),
    ]) &&
    matchesSelectFilter(debtsFilter.categoryId, debt.categoryId ?? "") &&
    matchesSelectFilter(debtsFilter.status, debt.isPaid ? "true" : "false") &&
    matchesSelectFilter(debtsFilter.type, debt.isRecurring ? "true" : "false")
  );

  function renderForm(resource: CrudResource) {
    const formEditing = editing?.resource === resource ? editing.item : null;
    const onCancel = closeForm;

    if (resource === "cards") {
      return <CardForm editing={formEditing} onSubmit={(event) => submit("cards", event)} onCancel={onCancel} />;
    }

    if (resource === "categories") {
      return (
        <CategoryForm
          editing={formEditing}
          key={formEditing ? text(formEditing, "id", "edit-category") : "new-category"}
          onCancel={onCancel}
          onSubmit={(event) => submit("categories", event)}
        />
      );
    }

    if (resource === "incomes") {
      return (
        <IncomeForm
          editing={formEditing}
          key={formEditing ? text(formEditing, "id", "edit-income") : "new-income"}
          onCancel={onCancel}
          onSubmit={(event) => submit("incomes", event)}
        />
      );
    }

    if (resource === "transactions") {
      return <TransactionForm cards={data.cards} categories={data.categories} editing={formEditing} onSubmit={(event) => submit("transactions", event)} onCancel={onCancel} />;
    }

    if (resource === "fixed") {
      return (
        <FixedExpenseForm
          categories={data.categories}
          editing={formEditing}
          key={formEditing ? text(formEditing, "id", "edit-fixed") : "new-fixed"}
          onSubmit={(event) => submit("fixed", event)}
          onCancel={onCancel}
        />
      );
    }

    if (resource === "installments") {
      return <InstallmentForm cards={data.cards} categories={data.categories} editing={formEditing} onSubmit={(event) => submit("installments", event)} onCancel={onCancel} />;
    }

    if (resource === "invoices") {
      return <InvoiceForm cards={data.cards} editing={formEditing} onSubmit={(event) => submit("invoices", event)} onCancel={onCancel} />;
    }

    return <DebtForm categories={data.categories} editing={formEditing} onSubmit={(event) => submit("debts", event)} onCancel={onCancel} />;
  }

  function shiftInvoiceMonth(months: number) {
    setInvoiceMonth((current) => new Date(current.getFullYear(), current.getMonth() + months, 1));
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>{activeTab === "overview" ? "Dashboard" : activeTabLabel}</div>
          <h1 className={styles.title}>{activeTab === "overview" ? "Visão geral financeira" : activeTabLabel}</h1>
        </div>
      </div>

      {shouldShowFormScreen && activeFormResource ? (
        <Modal onClose={closeForm}>
          <FormScreen onBack={closeForm}>{renderForm(activeFormResource)}</FormScreen>
        </Modal>
      ) : (
        <>
      {activeTab === "overview" && totals ? (
        <section className={dashboardStyles.topRow}>
          <BalanceHero
            balance={totals.balanceNow}
            onDeposit={() => navigateToTab("incomes")}
            onSend={() => navigateToTab("transactions")}
            projectedMonthEnd={totals.projectedMonthEnd}
          />
          <MetricCards
            expense={totals.outflowToDate}
            income={totals.spendableIncome}
            projected={totals.projectedMonthEnd}
          />
          <FinanceScore {...financeScore} />
        </section>
      ) : null}

      {activeTab === "overview" ? (
        <Overview
          advice={data.advice}
          invoices={data.invoices}
          installments={data.installments}
          onEdit={(resource, item) => edit(resource, asRecord(item))}
          onShowCashflow={scrollToCashflow}
          onShowCategories={() => navigateToTab("categories")}
          transactions={data.transactions}
        />
      ) : null}

      {activeTab === "cards" ? (
        <CrudPanel
          hasActiveFilters={Object.values(cardsFilter).some(Boolean)}
          onClear={() => clearFilters("cards")}
          onCreate={() => create("cards")}
          onQueryChange={(query) => updateFilters("cards", { q: query })}
          query={cardsFilter.q}
          title="Cartões"
        >
          <CardsTable cards={filteredCards} onEdit={(item) => edit("cards", asRecord(item))} onDelete={(id) => remove("cards", id)} />
        </CrudPanel>
      ) : null}

      {activeTab === "categories" ? (
        <CrudPanel
          hasActiveFilters={Object.values(categoriesFilter).some(Boolean)}
          onClear={() => clearFilters("categories")}
          onCreate={() => create("categories")}
          onQueryChange={(query) => updateFilters("categories", { q: query })}
          query={categoriesFilter.q}
          title="Categorias"
        >
          <CategoriesTable allocations={data.advice?.categoryAllocations ?? []} categories={filteredCategories} onEdit={(item) => edit("categories", asRecord(item))} onDelete={(id) => remove("categories", id)} />
        </CrudPanel>
      ) : null}

      {activeTab === "incomes" ? (
        <CrudPanel
          extraFilters={
            <Field label="Recorrência">
              <StyledSelect
                                onChange={(event) => updateFilters("incomes", { type: event.target.value })}
                value={incomesFilter.type}
              >
                <option value="">Todas</option>
                <option value="NONE">Isolada</option>
                <option value="WEEKLY">Semanal</option>
                <option value="BIWEEKLY">Quinzenal</option>
                <option value="MONTHLY">Mensal</option>
                <option value="YEARLY">Anual</option>
              </StyledSelect>
            </Field>
          }
          hasActiveFilters={Object.values(incomesFilter).some(Boolean)}
          onClear={() => clearFilters("incomes")}
          onCreate={() => create("incomes")}
          onQueryChange={(query) => updateFilters("incomes", { q: query })}
          query={incomesFilter.q}
          title="Entradas"
        >
          <IncomesTable incomes={filteredIncomes} onEdit={(item) => edit("incomes", asRecord(item))} onDelete={(id) => remove("incomes", id)} />
        </CrudPanel>
      ) : null}

      {activeTab === "transactions" ? (
        <div className={styles.unifiedStack}>
          <CrudPanel
            extraFilters={
              <>
                <Field label="Tipo">
                  <StyledSelect
                                        onChange={(event) => updateFilters("transactions", { type: event.target.value })}
                    value={transactionsFilter.type}
                  >
                    <option value="">Todos</option>
                    <option value="OUTFLOW">Saída</option>
                    <option value="INFLOW">Entrada</option>
                  </StyledSelect>
                </Field>
                <Field label="Categoria">
                  <CategorySelect categories={data.categories} onChange={(categoryId) => updateFilters("transactions", { categoryId })} value={transactionsFilter.categoryId} />
                </Field>
                <Field label="Cartão">
                  <CardSelect cards={data.cards} onChange={(cardId) => updateFilters("transactions", { cardId })} value={transactionsFilter.cardId} />
                </Field>
              </>
            }
            hasActiveFilters={Object.values(transactionsFilter).some(Boolean)}
            onClear={() => clearFilters("transactions")}
            onCreate={() => create("transactions")}
            onQueryChange={(query) => updateFilters("transactions", { q: query })}
            query={transactionsFilter.q}
            title="Compras e movimentações"
          >
            <TransactionsTable transactions={filteredTransactions} onEdit={(item) => edit("transactions", asRecord(item))} onDelete={(id) => remove("transactions", id)} />
          </CrudPanel>
          <CrudPanel
            extraFilters={
              <>
                <Field label="Categoria">
                  <CategorySelect categories={data.categories} onChange={(categoryId) => updateFilters("debts", { categoryId })} value={debtsFilter.categoryId} />
                </Field>
                <Field label="Status">
                  <StyledSelect
                                        onChange={(event) => updateFilters("debts", { status: event.target.value })}
                    value={debtsFilter.status}
                  >
                    <option value="">Todos</option>
                    <option value="false">Pendente</option>
                    <option value="true">Paga</option>
                  </StyledSelect>
                </Field>
                <Field label="Recorrência">
                  <StyledSelect
                                        onChange={(event) => updateFilters("debts", { type: event.target.value })}
                    value={debtsFilter.type}
                  >
                    <option value="">Todas</option>
                    <option value="false">Isolada</option>
                    <option value="true">Recorrente</option>
                  </StyledSelect>
                </Field>
              </>
            }
            hasActiveFilters={Object.values(debtsFilter).some(Boolean)}
            onClear={() => clearFilters("debts")}
            onCreate={() => create("debts")}
            onQueryChange={(query) => updateFilters("debts", { q: query })}
            query={debtsFilter.q}
            title="Dívidas"
          >
            <DebtsTable debts={filteredDebts} onEdit={(item) => edit("debts", asRecord(item))} onDelete={(id) => remove("debts", id)} />
          </CrudPanel>
        </div>
      ) : null}

      {activeTab === "installments" ? (
        <CrudPanel
          extraFilters={
            <>
              <Field label="Cartão">
                <CardSelect cards={data.cards} onChange={(cardId) => updateFilters("installments", { cardId })} value={installmentsFilter.cardId} />
              </Field>
              <Field label="Categoria">
                <CategorySelect categories={data.categories} onChange={(categoryId) => updateFilters("installments", { categoryId })} value={installmentsFilter.categoryId} />
              </Field>
            </>
          }
          hasActiveFilters={Object.values(installmentsFilter).some(Boolean)}
          onClear={() => clearFilters("installments")}
          onCreate={() => create("installments")}
          onQueryChange={(query) => updateFilters("installments", { q: query })}
          query={installmentsFilter.q}
          title="Parcelamentos"
        >
          <InstallmentsTable installments={filteredInstallments} onEdit={(item) => edit("installments", asRecord(item))} onDelete={(id) => remove("installments", id)} />
        </CrudPanel>
      ) : null}

      {activeTab === "fixed" ? (
        <CrudPanel
          extraFilters={
            <>
              <Field label="Categoria">
                <CategorySelect categories={data.categories} onChange={(categoryId) => updateFilters("fixed", { categoryId })} value={fixedFilter.categoryId} />
              </Field>
              <Field label="Status">
                <StyledSelect
                                    onChange={(event) => updateFilters("fixed", { active: event.target.value })}
                  value={fixedFilter.active}
                >
                  <option value="">Todos</option>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </StyledSelect>
              </Field>
            </>
          }
          hasActiveFilters={Object.values(fixedFilter).some(Boolean)}
          onClear={() => clearFilters("fixed")}
          onCreate={() => create("fixed")}
          onQueryChange={(query) => updateFilters("fixed", { q: query })}
          query={fixedFilter.q}
          title="Fixos"
        >
          <FixedExpensesTable expenses={filteredFixedExpenses} onEdit={(item) => edit("fixed", asRecord(item))} onDelete={(id) => remove("fixed", id)} onTogglePaid={toggleFixedExpensePayment} />
        </CrudPanel>
      ) : null}

      {activeTab === "invoices" ? (
        <CrudPanel
          extraFilters={
            <>
              <Field label="Cartão">
                <CardSelect cards={data.cards} onChange={(cardId) => updateFilters("invoices", { cardId })} value={invoicesFilter.cardId} />
              </Field>
              <Field label="Status">
                <StyledSelect
                                    onChange={(event) => updateFilters("invoices", { status: event.target.value })}
                  value={invoicesFilter.status}
                >
                  <option value="">Todos</option>
                  <option value="ABERTA">Aberta</option>
                  <option value="FECHADA">Fechada</option>
                  <option value="PAGA">Paga</option>
                </StyledSelect>
              </Field>
            </>
          }
          hasActiveFilters={Object.values(invoicesFilter).some(Boolean)}
          onClear={() => clearFilters("invoices")}
          onCreate={() => create("invoices")}
          onQueryChange={(query) => updateFilters("invoices", { q: query })}
          query={invoicesFilter.q}
          title="Faturas (cartões)"
        >
          <InvoiceTimeline
            invoices={timelineInvoices}
            monthLabel={monthFormatter.format(invoiceMonth)}
            onDelete={(id) => remove("invoices", id)}
            onEdit={(item) => edit("invoices", asRecord(item))}
            onNextMonth={() => shiftInvoiceMonth(1)}
            onPreviousMonth={() => shiftInvoiceMonth(-1)}
            totalAmount={timelineInvoices.reduce((sum, invoice) => sum + invoice.realAmount, 0)}
          />
        </CrudPanel>
      ) : null}
        </>
      )}
    </div>
  );
}

function Overview({
  advice,
  invoices,
  installments,
  transactions,
  onEdit,
  onShowCategories,
  onShowCashflow,
}: {
  advice: Advice | null;
  invoices: Invoice[];
  installments: Installment[];
  transactions: Transaction[];
  onEdit: (resource: Tab, item: unknown) => void;
  onShowCategories: () => void;
  onShowCashflow: () => void;
}) {
  return (
    <div className={styles.overviewStack}>
      <section className={dashboardStyles.middleRow}>
        <article className={dashboardStyles.card} id="cashflow-section">
          <div className={dashboardStyles.cardHeader}>
            <h2 className={dashboardStyles.cardTitle}>Fluxo de caixa</h2>
            <span className={dashboardStyles.cardMeta}>Últimos 12 meses</span>
          </div>
          <div className={dashboardStyles.cardBody}>
            <CashflowChart data={advice?.monthlyCashflow ?? []} />
          </div>
        </article>
        <AdvisorPanel
          daysRemaining={advice?.daysRemaining ?? 0}
          healthyDailySpend={advice?.healthyDailySpend ?? 0}
          onShowCashflow={onShowCashflow}
          onShowCategories={onShowCategories}
        />
      </section>

      <section className={dashboardStyles.bottomRow}>
        <article className={dashboardStyles.card}>
          <div className={dashboardStyles.cardHeader}>
            <h2 className={dashboardStyles.cardTitle}>Transações recentes</h2>
            <span className={dashboardStyles.cardMeta}>Compras e entradas</span>
          </div>
          <div className={dashboardStyles.cardBody}>
            <RecentTransactionsTable
              onEdit={(item) => onEdit("transactions", item)}
              transactions={transactions.slice(0, 8)}
            />
          </div>
        </article>
        <article className={dashboardStyles.card}>
          <div className={dashboardStyles.cardHeader}>
            <h2 className={dashboardStyles.cardTitle}>Gastos por categoria</h2>
            <span className={dashboardStyles.cardMeta}>Mês atual</span>
          </div>
          <div className={dashboardStyles.cardBody}>
            <CategoryDonut categories={advice?.categoryAllocations ?? []} />
          </div>
        </article>
      </section>

      <section className={dashboardStyles.secondaryRow}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Metas por categoria</h2>
            <span className={styles.panelMeta}>limite e gasto diário</span>
          </div>
          <div className={styles.panelBody}>
            {advice?.categoryAllocations.length ? (
              advice.categoryAllocations.map((category) => (
                <div className={styles.categoryRow} key={category.id}>
                  <div className={styles.categoryTop}>
                    <strong>{category.name}</strong>
                    <span>{category.remaining === null ? "sem meta" : currency.format(category.remaining)}</span>
                  </div>
                  <div className={styles.bar}>
                    <div className={styles.barFill} style={{ width: `${category.usage}%`, background: category.color }} />
                  </div>
                  <div className={styles.categoryHint}>
                    gasto: {currency.format(category.spent)} · meta:{" "}
                    {category.target > 0 ? currency.format(category.target) : "sem meta"} · por dia:{" "}
                    {category.dailyAllowance === null ? "sem meta" : currency.format(category.dailyAllowance)}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Cadastre categorias para ver limites e aconselhamento.</div>
            )}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Faturas e parcelamentos</h2>
            <span className={styles.panelMeta}>cartões e prazos</span>
          </div>
          <div className={styles.panelBody}>
            <InvoicesTable compact invoices={invoices.slice(0, 4)} onEdit={(item) => onEdit("invoices", item)} />
            <InstallmentsTable compact installments={installments.slice(0, 4)} onEdit={(item) => onEdit("installments", item)} />
          </div>
        </section>
      </section>
    </div>
  );
}

function EmptyTable() {
  return <div className={styles.empty}>Nenhum registro ainda.</div>;
}

function Th({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className={styles.thLabel}>
      <Icon size={14} />
      {children}
    </span>
  );
}

function RecurrenceTag({ income }: { income: Income }) {
  return (
    <span className={income.isRecurring ? styles.recurrenceTag : styles.singleTag}>
      <CalendarDays size={13} />
      {income.isRecurring ? recurrenceLabel(income) : `Única · ${dateLabel(income.date)}`}
    </span>
  );
}

function ExpenseRecurrenceTag({ expense }: { expense: FixedExpense }) {
  const pseudoIncome = {
    isRecurring: true,
    recurrenceType: expense.recurrenceType ?? "MONTHLY",
    recurrenceDay: expense.recurrenceDay ?? expense.dueDay,
    recurrenceMonth: expense.recurrenceMonth,
    date: expense.startDate,
  };

  return (
    <span className={styles.recurrenceTag}>
      <CalendarDays size={13} />
      {recurrenceLabel(pseudoIncome)}
    </span>
  );
}

function CardForm({
  editing,
  onSubmit,
  onCancel,
}: {
  editing: Record<string, unknown> | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <Form key={text(editing ?? {}, "id", "new")} onSubmit={onSubmit}>
      <Field label="Nome"><StyledInput name="name" defaultValue={text(editing ?? {}, "name")} required /></Field>
      <FieldGroup>
        <Field label="Limite"><MoneyInput name="limit" step="0.01" defaultValue={numberText(editing ?? {}, "limit")} required /></Field>
        <ColorPicker defaultValue={text(editing ?? {}, "color", "#111827")} label="Cor" options={categoryColorOptions} />
      </FieldGroup>
      <FieldGroup>
        <Field label="Fecha dia"><StyledInput name="closingDay" type="number" min="1" max="31" defaultValue={numberText(editing ?? {}, "closingDay")} required /></Field>
        <Field label="Vence dia"><StyledInput name="dueDay" type="number" min="1" max="31" defaultValue={numberText(editing ?? {}, "dueDay")} required /></Field>
      </FieldGroup>
      <FormActions editing={Boolean(editing)} onCancel={onCancel} />
    </Form>
  );
}

function CategoryForm(props: {
  editing: Record<string, unknown> | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const editing = props.editing ?? {};
  const editingId = text(editing, "id", "new");
  const initialName = text(editing, "name");
  const initialColor = text(editing, "color", "#10b981");
  const initialIcon = text(editing, "icon", "CircleDollarSign");
  const [categoryName, setCategoryName] = useState(initialName);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);

  const SelectedIcon = categoryIconOptions.find((option) => option.name === selectedIcon)?.icon ?? Tag;

  return (
    <Form key={editingId} onSubmit={props.onSubmit}>
      <input name="icon" type="hidden" value={selectedIcon} />
      <Field label="Nome">
        <StyledInput name="name" onChange={(event) => setCategoryName(event.target.value)} required value={categoryName} />
      </Field>
      <ColorPicker defaultValue={initialColor} label="Cor" onChange={setSelectedColor} options={categoryColorOptions} value={selectedColor} />
      <div className={styles.field}>
        <span>Ícone</span>
        <div className={styles.iconPicker} role="radiogroup" aria-label="Ícones de categoria">
          {categoryIconOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedIcon === option.name;
            return (
              <button
                aria-checked={isSelected}
                className={`${styles.iconOption} ${isSelected ? styles.iconOptionActive : ""}`}
                key={option.name}
                onClick={() => setSelectedIcon(option.name)}
                role="radio"
                type="button"
                title={option.label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.categoryPreviewCard}>
        <span className={styles.categoryPreviewIcon} style={{ backgroundColor: selectedColor }}>
          <SelectedIcon size={18} />
        </span>
        <div>
          <strong>{categoryName || "Nova categoria"}</strong>
          <span>Preview da categoria</span>
        </div>
      </div>
      <FieldGroup>
        <Field label="Ideal"><PercentInput name="allocationPercentage" step="0.1" defaultValue={numberText(editing, "allocationPercentage")} /></Field>
        <Field label="Limite"><MoneyInput name="maxLimit" step="0.01" defaultValue={numberText(editing, "maxLimit")} /></Field>
      </FieldGroup>
      <FormActions editing={Boolean(props.editing)} onCancel={props.onCancel} />
    </Form>
  );
}

function IncomeForm(props: {
  editing: Record<string, unknown> | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const editing = props.editing ?? {};
  const initialType =
    text(editing, "recurrenceType", booleanText(editing, "isRecurring") === "true" ? "MONTHLY" : "NONE") || "NONE";
  const initialDurationType = numberText(editing, "recurrenceCount")
    ? "COUNT"
    : text(editing, "endDate")
      ? "UNTIL_DATE"
      : "PERMANENT";
  const [recurrenceType, setRecurrenceType] = useState(initialType);
  const [durationType, setDurationType] = useState(initialDurationType);
  const fallbackDate = text(editing, "date");
  const fallbackDay = fallbackDate ? new Date(fallbackDate).getDate() : new Date().getDate();
  const fallbackWeekday = fallbackDate ? new Date(fallbackDate).getDay() : new Date().getDay();
  const fallbackMonth = fallbackDate ? new Date(fallbackDate).getMonth() + 1 : new Date().getMonth() + 1;

  return (
    <Form key={text(editing, "id", "new")} onSubmit={props.onSubmit}>
      <input name="isRecurring" type="hidden" value={recurrenceType === "NONE" ? "false" : "true"} />
      <Field label="Descrição"><StyledInput name="description" defaultValue={text(editing, "description")} required /></Field>
      <FieldGroup>
        <Field label="Valor"><MoneyInput name="amount" step="0.01" defaultValue={numberText(editing, "amount")} required /></Field>
        <Field label="Recorrência">
          <StyledSelect
                        name="recurrenceType"
            onChange={(event) => setRecurrenceType(event.target.value)}
            value={recurrenceType}
          >
            <option value="NONE">Isolada</option>
            <option value="WEEKLY">Semanal</option>
            <option value="BIWEEKLY">Quinzenal</option>
            <option value="MONTHLY">Mensal</option>
            <option value="YEARLY">Anual</option>
          </StyledSelect>
        </Field>
      </FieldGroup>
      <FieldGroup>
        {recurrenceType === "NONE" ? (
          <Field label="Data"><StyledInput name="date" type="date" defaultValue={dateInput(text(editing, "date"))} required /></Field>
        ) : null}
        {recurrenceType !== "NONE" ? (
          <Field label="Início">
            <StyledInput name="date" type="date" defaultValue={dateInput(text(editing, "date"))} required />
          </Field>
        ) : null}
        {recurrenceType === "WEEKLY" ? (
          <Field label="Dia da semana">
            <StyledSelect name="recurrenceDay" defaultValue={numberText(editing, "recurrenceDay", String(fallbackWeekday))}>
              <option value="0">Domingo</option>
              <option value="1">Segunda</option>
              <option value="2">Terça</option>
              <option value="3">Quarta</option>
              <option value="4">Quinta</option>
              <option value="5">Sexta</option>
              <option value="6">Sábado</option>
            </StyledSelect>
          </Field>
        ) : null}
        {recurrenceType === "BIWEEKLY" || recurrenceType === "MONTHLY" ? (
          <Field label={recurrenceType === "BIWEEKLY" ? "Primeiro dia do ciclo" : "Dia do mês"}>
            <StyledInput name="recurrenceDay" type="number" min="1" max="31" defaultValue={numberText(editing, "recurrenceDay", String(fallbackDay))} required />
          </Field>
        ) : null}
        {recurrenceType === "YEARLY" ? (
          <Field label="Dia">
            <StyledInput name="recurrenceDay" type="number" min="1" max="31" defaultValue={numberText(editing, "recurrenceDay", String(fallbackDay))} required />
          </Field>
        ) : null}
      </FieldGroup>
      {recurrenceType === "YEARLY" ? (
        <Field label="Mês">
          <StyledInput name="recurrenceMonth" type="number" min="1" max="12" defaultValue={numberText(editing, "recurrenceMonth", String(fallbackMonth))} required />
        </Field>
      ) : null}
      {recurrenceType !== "NONE" ? (
        <>
          <Field label="Duração">
            <StyledSelect
                            name="durationType"
              onChange={(event) => setDurationType(event.target.value)}
              value={durationType}
            >
              <option value="PERMANENT">Permanente</option>
              <option value="COUNT">Quantidade de recebimentos</option>
              <option value="UNTIL_DATE">Até uma data</option>
            </StyledSelect>
          </Field>
          {durationType === "COUNT" ? (
            <Field label="Receber por">
              <StyledInput
                min="1"
                name="recurrenceCount"
                placeholder="Ex.: 3"
                type="number"
                defaultValue={numberText(editing, "recurrenceCount")}
                required
              />
            </Field>
          ) : null}
          {durationType === "UNTIL_DATE" ? (
            <Field label="Data final">
              <StyledInput name="endDate" type="date" defaultValue={dateInput(text(editing, "endDate"))} required />
            </Field>
          ) : null}
        </>
      ) : null}
      <FormActions editing={Boolean(props.editing)} onCancel={props.onCancel} />
    </Form>
  );
}

function FixedExpenseForm(props: {
  categories: Category[];
  editing: Record<string, unknown> | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const editing = props.editing ?? {};
  const initialType = text(editing, "recurrenceType", "MONTHLY");
  const initialAmount = numberText(editing, "amount");
  const initialVariationMargin = numberText(editing, "variationMargin", "0");
  const [recurrenceType, setRecurrenceType] = useState(initialType);
  const [amountPreviewValue, setAmountPreviewValue] = useState(initialAmount);
  const [variationPreviewValue, setVariationPreviewValue] = useState(initialVariationMargin);
  const fallbackDate = text(editing, "startDate");
  const fallbackDay = numberText(editing, "recurrenceDay", numberText(editing, "dueDay", fallbackDate ? String(new Date(fallbackDate).getDate()) : String(new Date().getDate())));
  const fallbackWeekday = numberText(editing, "recurrenceDay", fallbackDate ? String(new Date(fallbackDate).getDay()) : String(new Date().getDay()));
  const fallbackMonth = numberText(editing, "recurrenceMonth", fallbackDate ? String(new Date(fallbackDate).getMonth() + 1) : String(new Date().getMonth() + 1));
  const amountPreview = Number(amountPreviewValue);
  const variationPreview = Number(variationPreviewValue);
  const hasVariationPreview = Number.isFinite(amountPreview) && amountPreview > 0 && Number.isFinite(variationPreview) && variationPreview > 0;
  const lowerPreview = amountPreview * (1 - variationPreview / 100);
  const upperPreview = amountPreview * (1 + variationPreview / 100);

  return (
    <Form key={text(editing, "id", "new")} onSubmit={props.onSubmit}>
      <Field label="Descrição"><StyledInput name="description" defaultValue={text(editing, "description")} required /></Field>
      <FieldGroup>
        <Field label="Valor">
          <MoneyInput
            name="amount"
            onChange={(event) => setAmountPreviewValue(event.target.value)}
            step="0.01"
            value={amountPreviewValue}
            required
          />
        </Field>
        <Field label="Margem de variação">
          <PercentInput
            name="variationMargin"
            onChange={(event) => setVariationPreviewValue(event.target.value)}
            step="0.1"
            value={variationPreviewValue}
          />
        </Field>
      </FieldGroup>
      <div className={styles.variationInlinePreview}>
        {hasVariationPreview
          ? `Varia entre ${currency.format(lowerPreview)} e ${currency.format(upperPreview)}`
          : "Informe valor e margem para ver a variação"}
      </div>
      <FieldGroup>
        <Field label="Recorrência">
          <StyledSelect name="recurrenceType" onChange={(event) => setRecurrenceType(event.target.value)} value={recurrenceType}>
            <option value="WEEKLY">Semanal</option>
            <option value="BIWEEKLY">Quinzenal</option>
            <option value="MONTHLY">Mensal</option>
            <option value="YEARLY">Anual</option>
          </StyledSelect>
        </Field>
        <Field label="Categoria"><CategorySelect categories={props.categories} defaultValue={text(editing, "categoryId")} required /></Field>
      </FieldGroup>
      <FieldGroup>
        {recurrenceType === "WEEKLY" ? (
          <Field label="Dia da semana">
            <StyledSelect name="recurrenceDay" defaultValue={fallbackWeekday}>
              <option value="0">Domingo</option>
              <option value="1">Segunda</option>
              <option value="2">Terça</option>
              <option value="3">Quarta</option>
              <option value="4">Quinta</option>
              <option value="5">Sexta</option>
              <option value="6">Sábado</option>
            </StyledSelect>
          </Field>
        ) : null}
        {recurrenceType === "BIWEEKLY" || recurrenceType === "MONTHLY" ? (
          <Field label={recurrenceType === "BIWEEKLY" ? "Primeiro dia do ciclo" : "Dia do mês"}>
            <StyledInput name="recurrenceDay" type="number" min="1" max="31" defaultValue={fallbackDay} required />
          </Field>
        ) : null}
        {recurrenceType === "YEARLY" ? (
          <>
            <Field label="Dia">
              <StyledInput name="recurrenceDay" type="number" min="1" max="31" defaultValue={fallbackDay} required />
            </Field>
            <Field label="Mês">
              <StyledInput name="recurrenceMonth" type="number" min="1" max="12" defaultValue={fallbackMonth} required />
            </Field>
          </>
        ) : null}
      </FieldGroup>
      <FieldGroup>
        <Field label="Início opcional"><StyledInput name="startDate" type="date" defaultValue={dateInput(text(editing, "startDate"))} /></Field>
        <Field label="Fim opcional"><StyledInput name="endDate" type="date" defaultValue={dateInput(text(editing, "endDate"))} /></Field>
      </FieldGroup>
      <Field label="Status">
        <StyledSelect name="isActive" defaultValue={booleanText(editing, "isActive", "true")}>
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </StyledSelect>
      </Field>
      <FormActions editing={Boolean(props.editing)} onCancel={props.onCancel} />
    </Form>
  );
}

function TransactionForm(props: {
  cards: Card[];
  categories: Category[];
  editing: Record<string, unknown> | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const editing = props.editing ?? {};
  return (
    <Form key={text(editing, "id", "new")} onSubmit={props.onSubmit}>
      <Field label="Descrição"><StyledInput name="description" defaultValue={text(editing, "description")} required /></Field>
      <FieldGroup>
        <Field label="Valor"><MoneyInput name="amount" step="0.01" defaultValue={numberText(editing, "amount")} required /></Field>
        <Field label="Data"><StyledInput name="date" type="date" defaultValue={dateInput(text(editing, "date"))} required /></Field>
      </FieldGroup>
      <FieldGroup>
        <Field label="Tipo">
          <StyledSelect name="type" defaultValue={text(editing, "type", "OUTFLOW")} required>
            <option value="OUTFLOW">Saída</option>
            <option value="INFLOW">Entrada</option>
          </StyledSelect>
        </Field>
        <Field label="Categoria"><CategorySelect categories={props.categories} defaultValue={text(editing, "categoryId")} /></Field>
      </FieldGroup>
      <Field label="Cartão opcional"><CardSelect cards={props.cards} defaultValue={text(editing, "cardId")} /></Field>
      <FormActions editing={Boolean(props.editing)} onCancel={props.onCancel} />
    </Form>
  );
}

function DebtForm(props: {
  categories: Category[];
  editing: Record<string, unknown> | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const editing = props.editing ?? {};
  return (
    <Form key={text(editing, "id", "new")} onSubmit={props.onSubmit}>
      <Field label="Descrição"><StyledInput name="description" defaultValue={text(editing, "description")} required /></Field>
      <FieldGroup>
        <Field label="Valor"><MoneyInput name="amount" step="0.01" defaultValue={numberText(editing, "amount")} required /></Field>
        <Field label="Data / início"><StyledInput name="date" type="date" defaultValue={dateInput(text(editing, "date"))} required /></Field>
      </FieldGroup>
      <FieldGroup>
        <Field label="Recorrência">
          <StyledSelect name="isRecurring" defaultValue={booleanText(editing, "isRecurring")}>
            <option value="false">Isolada</option>
            <option value="true">Recorrente</option>
          </StyledSelect>
        </Field>
        <Field label="Dia recorrente"><StyledInput name="dueDay" type="number" min="1" max="31" defaultValue={numberText(editing, "dueDay")} /></Field>
      </FieldGroup>
      <FieldGroup>
        <Field label="Categoria"><CategorySelect categories={props.categories} defaultValue={text(editing, "categoryId")} /></Field>
        <Field label="Fim opcional"><StyledInput name="endDate" type="date" defaultValue={dateInput(text(editing, "endDate"))} /></Field>
      </FieldGroup>
      <Field label="Status">
        <StyledSelect name="isPaid" defaultValue={booleanText(editing, "isPaid")}>
          <option value="false">Pendente</option>
          <option value="true">Paga</option>
        </StyledSelect>
      </Field>
      <FormActions editing={Boolean(props.editing)} onCancel={props.onCancel} />
    </Form>
  );
}

function InstallmentForm(props: {
  cards: Card[];
  categories: Category[];
  editing: Record<string, unknown> | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const editing = props.editing ?? {};
  return (
    <Form key={text(editing, "id", "new")} onSubmit={props.onSubmit}>
      <Field label="Descrição"><StyledInput name="description" defaultValue={text(editing, "description")} required /></Field>
      <FieldGroup>
        <Field label="Valor total"><MoneyInput name="totalAmount" step="0.01" defaultValue={numberText(editing, "totalAmount")} required /></Field>
        <Field label="Total de parcelas"><StyledInput name="totalInstallments" type="number" min="1" defaultValue={numberText(editing, "totalInstallments")} required /></Field>
      </FieldGroup>
      <FieldGroup>
        <Field label="Parcela atual"><StyledInput name="currentInstallment" type="number" min="1" defaultValue={numberText(editing, "currentInstallment", "1")} /></Field>
        <Field label="Início"><StyledInput name="startDate" type="date" defaultValue={dateInput(text(editing, "startDate"))} required /></Field>
      </FieldGroup>
      <FieldGroup>
        <Field label="Cartão"><CardSelect cards={props.cards} defaultValue={text(editing, "cardId")} required /></Field>
        <Field label="Categoria"><CategorySelect categories={props.categories} defaultValue={text(editing, "categoryId")} required /></Field>
      </FieldGroup>
      <FormActions editing={Boolean(props.editing)} onCancel={props.onCancel} />
    </Form>
  );
}

function InvoiceForm(props: {
  cards: Card[];
  editing: Record<string, unknown> | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const editing = props.editing ?? {};
  return (
    <Form key={text(editing, "id", "new")} onSubmit={props.onSubmit}>
      <Field label="Cartão"><CardSelect cards={props.cards} defaultValue={text(editing, "cardId")} required /></Field>
      <FieldGroup>
        <Field label="Mês"><StyledInput name="month" type="number" min="1" max="12" defaultValue={numberText(editing, "month")} required /></Field>
        <Field label="Ano"><StyledInput name="year" type="number" min="2000" defaultValue={numberText(editing, "year", String(new Date().getFullYear()))} required /></Field>
      </FieldGroup>
      <FieldGroup>
        <Field label="Valor real"><MoneyInput name="realAmount" step="0.01" defaultValue={numberText(editing, "realAmount")} required /></Field>
        <Field label="Status">
          <StyledSelect name="status" defaultValue={text(editing, "status", "ABERTA")}>
            <option value="ABERTA">Aberta</option>
            <option value="FECHADA">Fechada</option>
            <option value="PAGA">Paga</option>
          </StyledSelect>
        </Field>
      </FieldGroup>
      <FormActions editing={Boolean(props.editing)} onCancel={props.onCancel} />
    </Form>
  );
}

function CategorySelect({
  categories,
  defaultValue,
  onChange,
  required,
  value,
}: {
  categories: Category[];
  defaultValue?: string;
  onChange?: (categoryId: string) => void;
  required?: boolean;
  value?: string;
}) {
  const emptyLabel = onChange ? "Todas" : required ? "Selecione" : "Sem categoria";

  return (
    <StyledSelect
            defaultValue={onChange ? undefined : defaultValue ?? ""}
      name={onChange ? undefined : "categoryId"}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      required={required}
      value={onChange ? value ?? "" : undefined}
    >
      <option value="">{emptyLabel}</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>{category.name}</option>
      ))}
    </StyledSelect>
  );
}

function CardSelect({
  cards,
  defaultValue,
  onChange,
  required,
  value,
}: {
  cards: Card[];
  defaultValue?: string;
  onChange?: (cardId: string) => void;
  required?: boolean;
  value?: string;
}) {
  const emptyLabel = onChange ? "Todos" : required ? "Selecione" : "Sem cartão";

  return (
    <StyledSelect
            defaultValue={onChange ? undefined : defaultValue ?? ""}
      name={onChange ? undefined : "cardId"}
      onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      required={required}
      value={onChange ? value ?? "" : undefined}
    >
      <option value="">{emptyLabel}</option>
      {cards.map((card) => (
        <option key={card.id} value={card.id}>{card.name}</option>
      ))}
    </StyledSelect>
  );
}

function CardsTable({ cards, onEdit, onDelete }: { cards: Card[]; onEdit: (item: Card) => void; onDelete: (id: string) => void }) {
  if (!cards.length) return <EmptyTable />;
  return (
    <Table>
      <TableHeader><TableRow><TableHead><Th icon={CreditCard}>Cartão</Th></TableHead><TableHead><Th icon={Banknote}>Limite</Th></TableHead><TableHead><Th icon={CalendarDays}>Fechamento</Th></TableHead><TableHead><Th icon={Timer}>Vencimento</Th></TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>
        {cards.map((card) => (
          <TableRow key={card.id}>
            <TableCell><span className={styles.colorDot} style={{ background: card.color }} />{card.name}</TableCell>
            <TableCell>{currency.format(card.limit)}</TableCell>
            <TableCell>Dia {card.closingDay}</TableCell>
            <TableCell>Dia {card.dueDay}</TableCell>
            <TableCell><Actions onEdit={() => onEdit(card)} onDelete={() => onDelete(card.id)} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CategoriesTable({ categories, allocations, onEdit, onDelete }: { categories: Category[]; allocations: CategoryAllocation[]; onEdit: (item: Category) => void; onDelete: (id: string) => void }) {
  if (!categories.length) return <EmptyTable />;
  return (
    <Table>
      <TableHeader><TableRow><TableHead><Th icon={Tag}>Categoria</Th></TableHead><TableHead><Th icon={Percent}>Meta</Th></TableHead><TableHead><Th icon={WalletCards}>Restante</Th></TableHead><TableHead><Th icon={CalendarDays}>Diário</Th></TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>
        {categories.map((category) => {
          const allocation = allocations.find((item) => item.id === category.id);
          const CategoryIcon = categoryIconOptions.find((option) => option.name === category.icon)?.icon ?? Tag;
          return (
            <TableRow key={category.id}>
              <TableCell>
                <span className={styles.categoryIdentity}>
                  <span className={styles.categoryIconBadge} style={{ backgroundColor: category.color }}>
                    <CategoryIcon size={14} />
                  </span>
                  {category.name}
                </span>
              </TableCell>
              <TableCell>{category.maxLimit ? currency.format(category.maxLimit) : `${category.allocationPercentage ?? 0}%`}</TableCell>
              <TableCell>{allocation?.remaining === null || allocation?.remaining === undefined ? "-" : currency.format(allocation.remaining)}</TableCell>
              <TableCell>{allocation?.dailyAllowance === null || allocation?.dailyAllowance === undefined ? "-" : currency.format(allocation.dailyAllowance)}</TableCell>
              <TableCell><Actions onEdit={() => onEdit(category)} onDelete={() => onDelete(category.id)} /></TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function IncomesTable({ incomes, onEdit, onDelete }: { incomes: Income[]; onEdit: (item: Income) => void; onDelete: (id: string) => void }) {
  if (!incomes.length) return <EmptyTable />;
  return (
    <Table>
      <TableHeader><TableRow><TableHead><Th icon={Type}>Descrição</Th></TableHead><TableHead><Th icon={Banknote}>Valor</Th></TableHead><TableHead><Th icon={Repeat}>Recorrência</Th></TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{incomes.map((income) => (
        <TableRow key={income.id}>
          <TableCell>{income.description}<small>{income.isRecurring ? "Recorrente" : "Isolada"}</small></TableCell>
          <TableCell>{currency.format(income.amount)}</TableCell>
          <TableCell><RecurrenceTag income={income} /></TableCell>
          <TableCell><Actions onEdit={() => onEdit(income)} onDelete={() => onDelete(income.id)} /></TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}

function TransactionsTable({ transactions, compact, onEdit, onDelete }: { transactions: Transaction[]; compact?: boolean; onEdit: (item: Transaction) => void; onDelete?: (id: string) => void }) {
  if (!transactions.length) return <EmptyTable />;
  return (
    <Table>
      <TableHeader><TableRow><TableHead><Th icon={Type}>Descrição</Th></TableHead><TableHead><Th icon={Tag}>Categoria</Th></TableHead><TableHead><Th icon={CalendarDays}>Data</Th></TableHead><TableHead><Th icon={Banknote}>Valor</Th></TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{transactions.map((transaction) => (
        <TableRow key={transaction.id}>
          <TableCell>{transaction.description}<small>{transaction.card?.name ?? (transaction.type === "INFLOW" ? "Entrada" : "Conta")}</small></TableCell>
          <TableCell>{transaction.category?.name ?? "-"}</TableCell>
          <TableCell>{dateLabel(transaction.date)}</TableCell>
          <TableCell className={transaction.type === "INFLOW" ? styles.positive : styles.negative}>{currency.format(transaction.amount)}</TableCell>
          <TableCell>{compact ? <Actions onEdit={() => onEdit(transaction)} /> : <Actions onEdit={() => onEdit(transaction)} onDelete={onDelete ? () => onDelete(transaction.id) : undefined} />}</TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}

function FixedExpensesTable({
  expenses,
  onEdit,
  onDelete,
  onTogglePaid,
}: {
  expenses: FixedExpense[];
  onEdit: (item: FixedExpense) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (item: FixedExpense) => void;
}) {
  if (!expenses.length) return <EmptyTable />;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return (
    <Table>
      <TableHeader><TableRow><TableHead><Th icon={ReceiptText}>Gasto</Th></TableHead><TableHead><Th icon={Tag}>Categoria</Th></TableHead><TableHead><Th icon={TrendingDown}>Valor previsto</Th></TableHead><TableHead><Th icon={CalendarDays}>Recorrência</Th></TableHead><TableHead><Th icon={CheckCircle2}>Mês atual</Th></TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{expenses.map((expense) => {
        const isPaid = Boolean(
          expense.payments?.some(
            (payment) => payment.month === currentMonth && payment.year === currentYear && payment.isPaid
          )
        );

        return (
          <TableRow key={expense.id}>
            <TableCell>{expense.description}<small>{expense.isActive ? "Ativa" : "Inativa"}</small></TableCell>
            <TableCell>{expense.category.name}</TableCell>
            <TableCell>{currency.format(expense.amount * (1 + expense.variationMargin / 100))}<small>margem {expense.variationMargin}%</small></TableCell>
            <TableCell><ExpenseRecurrenceTag expense={expense} /></TableCell>
            <TableCell>
              <button
                className={`${styles.paymentToggle} ${isPaid ? styles.paymentTogglePaid : ""}`}
                onClick={() => onTogglePaid(expense)}
                type="button"
              >
                <CheckCircle2 size={14} />
                {isPaid ? "Pago" : "Pendente"}
              </button>
            </TableCell>
            <TableCell><Actions onEdit={() => onEdit(expense)} onDelete={() => onDelete(expense.id)} /></TableCell>
          </TableRow>
        );
      })}</TableBody>
    </Table>
  );
}

function InstallmentsTable({ installments, compact, onEdit, onDelete }: { installments: Installment[]; compact?: boolean; onEdit: (item: Installment) => void; onDelete?: (id: string) => void }) {
  if (!installments.length) return <EmptyTable />;
  return (
    <Table>
      <TableHeader><TableRow><TableHead><Th icon={ReceiptText}>Compra</Th></TableHead><TableHead><Th icon={CreditCard}>Cartão</Th></TableHead><TableHead><Th icon={Hash}>Parcela</Th></TableHead><TableHead><Th icon={CalendarDays}>Termina em</Th></TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{installments.map((installment) => {
        const end = new Date(installment.startDate);
        end.setMonth(end.getMonth() + installment.totalInstallments - installment.currentInstallment);
        return (
          <TableRow key={installment.id}>
            <TableCell>{installment.description}<small>{currency.format(installment.amountPerInstallment)} por mês</small></TableCell>
            <TableCell>{installment.card.name}</TableCell>
            <TableCell>{installment.currentInstallment}/{installment.totalInstallments}</TableCell>
            <TableCell>{dateLabel(end.toISOString())}</TableCell>
            <TableCell>{compact ? <Actions onEdit={() => onEdit(installment)} /> : <Actions onEdit={() => onEdit(installment)} onDelete={onDelete ? () => onDelete(installment.id) : undefined} />}</TableCell>
          </TableRow>
        );
      })}</TableBody>
    </Table>
  );
}

function InvoiceTimeline({
  invoices,
  monthLabel,
  onDelete,
  onEdit,
  onNextMonth,
  onPreviousMonth,
  totalAmount,
}: {
  invoices: Invoice[];
  monthLabel: string;
  onDelete: (id: string) => void;
  onEdit: (item: Invoice) => void;
  onNextMonth: () => void;
  onPreviousMonth: () => void;
  totalAmount: number;
}) {
  const paidCount = invoices.filter((invoice) => invoice.status === "PAGA").length;
  const openCount = invoices.length - paidCount;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Timeline mensal</div>
          <h3 className="m-0 mt-1 text-lg font-semibold capitalize text-foreground">{monthLabel}</h3>
          <p className="m-0 mt-1 text-sm text-muted-foreground">
            {invoices.length} fatura{invoices.length === 1 ? "" : "s"} · {currency.format(totalAmount)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onPreviousMonth} type="button" variant="secondary">
            <ChevronLeft size={16} />
            Mês anterior
          </Button>
          <Button onClick={onNextMonth} type="button" variant="secondary">
            Próximo mês
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <UiCard size="sm">
          <CardHeader>
            <CardTitle>Total do mês</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">{currency.format(totalAmount)}</CardContent>
        </UiCard>
        <UiCard size="sm">
          <CardHeader>
            <CardTitle>Em aberto</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">{openCount}</CardContent>
        </UiCard>
        <UiCard size="sm">
          <CardHeader>
            <CardTitle>Pagas</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">{paidCount}</CardContent>
        </UiCard>
      </div>

      {invoices.length ? (
        <div className="relative grid gap-3 pl-5 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-border">
          {invoices.map((invoice) => (
            <div className="relative rounded-xl border border-border bg-card p-4 shadow-sm" key={invoice.id}>
              <span className="absolute -left-[1.1rem] top-5 size-3 rounded-full border-2 border-background bg-primary" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="m-0 text-base font-semibold text-foreground">{invoice.card.name}</h4>
                    <span
                      className={`badge ${
                        invoice.status === "PAGA"
                          ? "badge-success"
                          : invoice.status === "FECHADA"
                            ? "badge-warning"
                            : ""
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <p className="m-0 mt-1 text-sm text-muted-foreground">
                    Fatura de {String(invoice.month).padStart(2, "0")}/{invoice.year}
                  </p>
                  <p className="m-0 mt-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <CalendarDays size={14} />
                    Vence em {dateLabel(invoiceDueDate(invoice).toISOString())}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{currency.format(invoice.realAmount)}</div>
                  <Actions onEdit={() => onEdit(invoice)} onDelete={() => onDelete(invoice.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
          Nenhuma fatura encontrada para este mês com os filtros atuais.
        </div>
      )}
    </div>
  );
}

function InvoicesTable({ invoices, compact, onEdit, onDelete }: { invoices: Invoice[]; compact?: boolean; onEdit: (item: Invoice) => void; onDelete?: (id: string) => void }) {
  if (!invoices.length) return <EmptyTable />;
  return (
    <Table>
      <TableHeader><TableRow><TableHead><Th icon={CreditCard}>Cartão</Th></TableHead><TableHead><Th icon={CalendarDays}>Mês</Th></TableHead><TableHead><Th icon={CheckCircle2}>Status</Th></TableHead><TableHead><Th icon={Banknote}>Valor real</Th></TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{invoices.map((invoice) => (
        <TableRow key={invoice.id}>
          <TableCell>{invoice.card.name}</TableCell>
          <TableCell>{String(invoice.month).padStart(2, "0")}/{invoice.year}</TableCell>
          <TableCell>
            <span
              className={`badge ${
                invoice.status === "PAGA"
                  ? "badge-success"
                  : invoice.status === "FECHADA"
                    ? "badge-warning"
                    : ""
              }`}
            >
              {invoice.status}
            </span>
          </TableCell>
          <TableCell>{currency.format(invoice.realAmount)}</TableCell>
          <TableCell>{compact ? <Actions onEdit={() => onEdit(invoice)} /> : <Actions onEdit={() => onEdit(invoice)} onDelete={onDelete ? () => onDelete(invoice.id) : undefined} />}</TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}

function DebtsTable({ debts, onEdit, onDelete }: { debts: Debt[]; onEdit: (item: Debt) => void; onDelete: (id: string) => void }) {
  if (!debts.length) return <EmptyTable />;
  return (
    <Table>
      <TableHeader><TableRow><TableHead><Th icon={ListChecks}>Dívida</Th></TableHead><TableHead><Th icon={Tag}>Categoria</Th></TableHead><TableHead><Th icon={CalendarDays}>Quando</Th></TableHead><TableHead><Th icon={CheckCircle2}>Status</Th></TableHead><TableHead /></TableRow></TableHeader>
      <TableBody>{debts.map((debt) => (
        <TableRow key={debt.id}>
          <TableCell>{debt.description}<small>{currency.format(debt.amount)}</small></TableCell>
          <TableCell>{debt.category?.name ?? "-"}</TableCell>
          <TableCell>{debt.isRecurring ? `Todo dia ${debt.dueDay ?? new Date(debt.date).getDate()}` : dateLabel(debt.date)}</TableCell>
          <TableCell>
            <span className={`badge ${debt.isPaid ? "badge-success" : "badge-warning"}`}>
              {debt.isPaid ? "Paga" : "Pendente"}
            </span>
          </TableCell>
          <TableCell><Actions onEdit={() => onEdit(debt)} onDelete={() => onDelete(debt.id)} /></TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}
