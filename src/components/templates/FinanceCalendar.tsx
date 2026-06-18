"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { CardTag } from "@/components/moleculas/TableColumns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/atoms/sheet";
import { formatCurrency } from "@/lib/format";
import type { CalendarDaySummary, CalendarDayItem, CalendarMonthData } from "@/lib/finance";
import { toDateKey } from "@/lib/finance";
import { cn } from "@/lib/utils";
import styles from "./FinanceCalendar.module.css";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

type MonthCell = {
  dateKey: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
};

function truncateLabel(label: string, max = 16) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

const MAX_CELL_ITEMS = 3;

const CALENDAR_FILTERS = [
  { id: "income", label: "Entradas" },
  { id: "fixed_expense", label: "Gastos fixos" },
  { id: "invoice", label: "Faturas" },
  { id: "card", label: "Cartão" },
  { id: "misc_expense", label: "Gastos avulsos" },
  { id: "debt", label: "Dívidas" },
] as const;

type CalendarFilterId = (typeof CALENDAR_FILTERS)[number]["id"];

function isExpenseType(type: CalendarDayItem["type"]) {
  return type !== "income" && type !== "transaction_inflow";
}

function matchesCalendarFilter(item: CalendarDayItem, activeFilters: Set<CalendarFilterId>) {
  if (activeFilters.size === 0) return true;

  if (item.type === "income" || item.type === "transaction_inflow") {
    return activeFilters.has("income");
  }

  if (item.type === "fixed_expense") return activeFilters.has("fixed_expense");
  if (item.type === "invoice") return activeFilters.has("invoice");
  if (item.type === "installment") return activeFilters.has("card");
  if (item.type === "debt") return activeFilters.has("debt");

  if (item.type === "transaction_outflow") {
    return item.card ? activeFilters.has("card") : activeFilters.has("misc_expense");
  }

  return false;
}

function filterCalendarData(data: CalendarMonthData, activeFilters: Set<CalendarFilterId>): CalendarMonthData {
  const days = data.days
    .map((day) => {
      const items = day.items.filter((item) => matchesCalendarFilter(item, activeFilters));
      const income = items
        .filter((item) => !isExpenseType(item.type))
        .reduce((sum, item) => sum + item.amount, 0);
      const expense = items
        .filter((item) => isExpenseType(item.type))
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        ...day,
        items,
        income,
        expense,
        balance: income - expense,
      };
    })
    .filter((day) => day.items.length > 0);

  const totals = days.reduce(
    (acc, day) => ({
      income: acc.income + day.income,
      expense: acc.expense + day.expense,
      balance: acc.balance + day.balance,
    }),
    { income: 0, expense: 0, balance: 0 }
  );

  return { ...data, days, totals };
}

function compactCurrency(value: number) {
  if (value >= 1000) {
    return formatCurrency(value).replace(/\s/g, "");
  }
  return formatCurrency(value);
}

function buildMonthGrid(year: number, month: number, today: Date): MonthCell[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
  const cells: MonthCell[] = [];
  const todayKey = toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());

  for (let index = 0; index < firstWeekday; index++) {
    const day = daysInPrevMonth - firstWeekday + index + 1;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const dateKey = toDateKey(prevYear, prevMonth, day);
    cells.push({ dateKey, day, inMonth: false, isToday: dateKey === todayKey });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = toDateKey(year, month, day);
    cells.push({ dateKey, day, inMonth: true, isToday: dateKey === todayKey });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - firstWeekday - daysInMonth + 1;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const dateKey = toDateKey(nextYear, nextMonth, nextDay);
    cells.push({ dateKey, day: nextDay, inMonth: false, isToday: dateKey === todayKey });
  }

  return cells;
}

function itemTypeLabel(type: CalendarDayItem["type"]) {
  if (type === "income") return "Entrada";
  if (type === "transaction_inflow") return "Entrada";
  if (type === "fixed_expense") return "Gasto fixo";
  if (type === "installment") return "Parcela";
  if (type === "debt") return "Dívida";
  if (type === "invoice") return "Fatura";
  return "Gasto";
}

function ItemLabel({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <span className={styles.itemLabel}>
      <CircleDollarSign aria-hidden className={styles.amountIcon} size={compact ? 10 : 14} />
      <span className={styles.cellItemLabel}>{compact ? truncateLabel(label) : label}</span>
    </span>
  );
}

function ItemAmount({
  amount,
  expense,
  className,
  compact = false,
}: {
  amount: number;
  expense: boolean;
  className?: string;
  compact?: boolean;
}) {
  const formatted = compact ? compactCurrency(amount) : formatCurrency(amount);

  return (
    <span className={cn(styles.itemAmount, className)}>
      {expense ? "-" : "+"}
      {formatted}
    </span>
  );
}

export function FinanceCalendar() {
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<CalendarMonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<CalendarFilterId>>(() => new Set());

  const loadMonth = useCallback(async (nextYear: number, nextMonth: number) => {
    setLoading(true);
    const response = await fetch(`/api/calendar?year=${nextYear}&month=${nextMonth}`);

    if (!response.ok) {
      setData(null);
      setLoading(false);
      return;
    }

    setData(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMonth(year, month);
  }, [loadMonth, month, year]);

  const filteredData = useMemo(
    () => (data ? filterCalendarData(data, activeFilters) : null),
    [activeFilters, data]
  );

  const daysByDate = useMemo(() => {
    const map = new Map<string, CalendarDaySummary>();
    for (const day of filteredData?.days ?? []) {
      map.set(day.date, day);
    }
    return map;
  }, [filteredData]);

  const selectedDay = selectedDayKey ? daysByDate.get(selectedDayKey) ?? null : null;

  useEffect(() => {
    if (selectedDayKey && !daysByDate.has(selectedDayKey)) {
      setSheetOpen(false);
      setSelectedDayKey(null);
    }
  }, [daysByDate, selectedDayKey]);

  const monthCells = useMemo(() => buildMonthGrid(year, month, today), [month, today, year]);
  const visibleMonth = useMemo(() => new Date(year, month - 1, 1), [month, year]);

  function goToPreviousMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((current) => current - 1);
      return;
    }
    setMonth((current) => current - 1);
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((current) => current + 1);
      return;
    }
    setMonth((current) => current + 1);
  }

  function toggleFilter(filterId: CalendarFilterId) {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return next;
    });
  }

  function clearFilters() {
    setActiveFilters(new Set());
  }

  function openDay(dateKey: string) {
    setSelectedDayKey(dateKey);
    setSheetOpen(true);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Visão temporal</div>
          <h1 className={styles.title}>Calendário financeiro</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button aria-label="Mês anterior" onClick={goToPreviousMonth} type="button" variant="secondary">
            <ChevronLeft size={18} />
          </Button>
          <span className="min-w-36 text-center text-sm font-semibold capitalize">
            {monthFormatter.format(visibleMonth)}
          </span>
          <Button aria-label="Próximo mês" onClick={goToNextMonth} type="button" variant="secondary">
            <ChevronRight size={18} />
          </Button>
        </div>
      </header>

      {filteredData ? (
        <section className={styles.summary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Entradas</div>
            <div className={cn(styles.summaryValue, styles.income)}>
              {formatCurrency(filteredData.totals.income)}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Gastos</div>
            <div className={cn(styles.summaryValue, styles.expense)}>
              {formatCurrency(filteredData.totals.expense)}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.filters}>
        <div className={styles.filtersLabel}>Filtrar por</div>
        <div className={styles.filterList}>
          {CALENDAR_FILTERS.map((filter) => {
            const isActive = activeFilters.has(filter.id);
            return (
              <button
                key={filter.id}
                aria-pressed={isActive}
                className={cn(styles.filterChip, isActive && styles.filterChipActive)}
                onClick={() => toggleFilter(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            );
          })}
          {activeFilters.size > 0 ? (
            <button className={styles.filterClear} onClick={clearFilters} type="button">
              Limpar
            </button>
          ) : null}
        </div>
      </section>

      <section className={styles.calendarCard}>
        {loading ? (
          <div className={styles.loading}>Carregando calendário...</div>
        ) : (
          <>
            <div className={styles.weekdays}>
              {WEEKDAYS.map((weekday) => (
                <div className={styles.weekday} key={weekday}>
                  {weekday}
                </div>
              ))}
            </div>

            <div className={styles.grid}>
              {monthCells.map((cell) => {
                const summary = daysByDate.get(cell.dateKey);
                const hasActivity = Boolean(summary);
                const isSelected = selectedDayKey === cell.dateKey && sheetOpen;

                return (
                  <button
                    key={cell.dateKey}
                    className={cn(
                      styles.cell,
                      !cell.inMonth && styles.cellOutside,
                      cell.isToday && styles.cellToday,
                      hasActivity && styles.cellActive,
                      isSelected && styles.cellSelected
                    )}
                    disabled={!hasActivity}
                    onClick={() => openDay(cell.dateKey)}
                    type="button"
                  >
                    <span className={styles.cellDay}>{cell.day}</span>
                    {summary ? (
                      <ul className={styles.cellItems}>
                        {summary.items.slice(0, MAX_CELL_ITEMS).map((item) => (
                          <li
                            className={cn(
                              styles.cellItem,
                              isExpenseType(item.type)
                                ? styles.cellItemExpense
                                : styles.cellItemIncome
                            )}
                            key={item.id}
                          >
                            <ItemLabel compact label={item.label} />
                            <ItemAmount amount={item.amount} compact expense={isExpenseType(item.type)} />
                          </li>
                        ))}
                        {summary.items.length > MAX_CELL_ITEMS ? (
                          <li className={styles.cellItemMore}>
                            +{summary.items.length - MAX_CELL_ITEMS} mais
                          </li>
                        ) : null}
                      </ul>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      <Sheet
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSelectedDayKey(null);
        }}
        open={sheetOpen}
      >
        <SheetContent className="w-full sm:max-w-md" side="right">
          {selectedDay ? (
            <>
              <SheetHeader>
                <SheetTitle className="capitalize">
                  {dayFormatter.format(new Date(`${selectedDay.date}T12:00:00`))}
                </SheetTitle>
                <SheetDescription>Detalhes das movimentações do dia.</SheetDescription>
              </SheetHeader>

              <div className={styles.detailTotals}>
                <div className={styles.detailTotalRow}>
                  <span>Entradas</span>
                  <span className={styles.income}>{formatCurrency(selectedDay.income)}</span>
                </div>
                <div className={styles.detailTotalRow}>
                  <span>Gastos</span>
                  <span className={styles.expense}>{formatCurrency(selectedDay.expense)}</span>
                </div>
              </div>

              <div className={styles.detailList}>
                {selectedDay.items.map((item) => (
                  <article
                    className={cn(
                      styles.detailItem,
                      isExpenseType(item.type) ? styles.detailItemExpense : styles.detailItemIncome
                    )}
                    key={item.id}
                  >
                    <div className={styles.detailMain}>
                      <div className={styles.detailTitle}>
                        <ItemLabel label={item.label} />
                      </div>
                      <div className={styles.detailMeta}>
                        {itemTypeLabel(item.type)}
                        {item.category ? ` · ${item.category.name}` : ""}
                        {item.card ? (
                          <>
                            {" · "}
                            <CardTag color={item.card.color} name={item.card.name} />
                          </>
                        ) : null}
                      </div>
                    </div>
                    <ItemAmount
                      amount={item.amount}
                      className={cn(
                        styles.detailAmount,
                        isExpenseType(item.type) ? styles.expense : styles.income
                      )}
                      expense={isExpenseType(item.type)}
                    />
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
