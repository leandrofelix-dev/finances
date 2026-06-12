"use client";

import type { ReactNode } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Hash,
  ListChecks,
  Percent,
  ReceiptText,
  Repeat,
  Tag,
  Timer,
  TrendingDown,
  Type,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { TableCell, TableHead } from "@/components/atoms/table";
import { formatCurrency, formatDate, formatDateTime, formatDueDay, formatMonthYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TableActions } from "@/components/moleculas/TableActions";

export type ColumnKind =
  | "description"
  | "money"
  | "date"
  | "month"
  | "dueDay"
  | "status"
  | "category"
  | "card"
  | "recurrence"
  | "installment"
  | "percent"
  | "actions";

const columnMeta: Record<Exclude<ColumnKind, "actions">, { icon: LucideIcon; label: string }> = {
  description: { icon: Type, label: "Descrição" },
  money: { icon: Banknote, label: "Valor" },
  date: { icon: CalendarDays, label: "Data" },
  month: { icon: CalendarDays, label: "Mês" },
  dueDay: { icon: CalendarDays, label: "Vencimento" },
  status: { icon: CheckCircle2, label: "Status" },
  category: { icon: Tag, label: "Categoria" },
  card: { icon: CreditCard, label: "Cartão" },
  recurrence: { icon: Repeat, label: "Recorrência" },
  installment: { icon: Hash, label: "Parcela" },
  percent: { icon: Percent, label: "Meta" },
};

const columnIcons = {
  expense: ReceiptText,
  debt: ListChecks,
  closing: Timer,
  remaining: WalletCards,
  forecast: TrendingDown,
} as const;

type StatusTone = "success" | "warning" | "muted" | "danger";

const statusToneClass: Record<StatusTone, string> = {
  success: "badge-success",
  warning: "badge-warning",
  muted: "",
  danger: "badge-danger",
};

export function ColumnHeader({
  kind,
  icon,
  label,
  align = "left",
}: {
  kind: ColumnKind;
  icon?: LucideIcon;
  label?: string;
  align?: "left" | "right";
}) {
  if (kind === "actions") {
    return null;
  }

  const meta = columnMeta[kind];
  const Icon = icon ?? meta.icon;
  const text = label ?? meta.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        align === "right" && "ml-auto"
      )}
    >
      <Icon className="size-3.5 shrink-0 text-primary" strokeWidth={2.2} />
      {text}
    </span>
  );
}

export function ColumnHead({
  kind,
  icon,
  label,
  align = "left",
  className,
}: {
  kind: ColumnKind;
  icon?: LucideIcon;
  label?: string;
  align?: "left" | "right";
  className?: string;
}) {
  if (kind === "actions") {
    return <TableHead className={cn("w-[1%]", className)} />;
  }

  return (
    <TableHead className={cn(align === "right" && "text-right", className)}>
      <ColumnHeader align={align} icon={icon} kind={kind} label={label} />
    </TableHead>
  );
}

export function EmptyTableState({ message = "Nenhum registro ainda." }: { message?: string }) {
  return <div className="py-3 text-sm text-muted-foreground">{message}</div>;
}

export function DescriptionCell({
  title,
  subtitle,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}) {
  return (
    <TableCell className={className}>
      <div className="font-medium text-foreground">{title}</div>
      {subtitle ? <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div> : null}
    </TableCell>
  );
}

export function MoneyCell({
  value,
  subtitle,
  tone = "default",
  className,
}: {
  value: number;
  subtitle?: ReactNode;
  tone?: "default" | "positive" | "negative";
  className?: string;
}) {
  return (
    <TableCell
      className={cn(
        "font-medium tabular-nums",
        tone === "positive" && "text-emerald-600",
        tone === "negative" && "text-red-400",
        className
      )}
    >
      {formatCurrency(value)}
      {subtitle ? <div className="mt-0.5 text-xs font-normal text-muted-foreground">{subtitle}</div> : null}
    </TableCell>
  );
}

export function DateCell({
  value,
  format = "date",
  className,
}: {
  value?: string | Date | null;
  format?: "date" | "datetime";
  className?: string;
}) {
  const label = format === "datetime" && value ? formatDateTime(String(value)) : formatDate(value);

  return (
    <TableCell className={cn("text-muted-foreground", className)}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5 shrink-0 text-muted-foreground/80" />
        {label}
      </span>
    </TableCell>
  );
}

export function MonthYearCell({ month, year }: { month: number; year: number }) {
  return (
    <TableCell className="text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5 shrink-0 text-muted-foreground/80" />
        {formatMonthYear(month, year)}
      </span>
    </TableCell>
  );
}

export function DueDayCell({ day }: { day: number }) {
  return (
    <TableCell className="text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5 shrink-0 text-muted-foreground/80" />
        {formatDueDay(day)}
      </span>
    </TableCell>
  );
}

export function TextCell({ children, className }: { children: ReactNode; className?: string }) {
  return <TableCell className={className}>{children}</TableCell>;
}

export function CategoryTag({
  color,
  icon: Icon = Tag,
  name,
}: {
  color?: string | null;
  icon?: LucideIcon;
  name: string;
}) {
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold text-white shadow-sm"
      style={{ backgroundColor: color ?? "var(--primary)" }}
    >
      <Icon className="shrink-0" size={12} />
      {name}
    </span>
  );
}

export function CardTag({ color, name }: { color?: string | null; name: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted/60 px-2 py-0.5 text-xs font-semibold text-foreground">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color ?? "var(--primary)" }}
      />
      {name}
    </span>
  );
}

export function StatusCell({ label, tone = "muted" }: { label: string; tone?: StatusTone }) {
  return (
    <TableCell>
      <span className={cn("badge", statusToneClass[tone])}>{label}</span>
    </TableCell>
  );
}

export function ActionsCell({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <TableCell className="text-right">
      <TableActions onDelete={onDelete} onEdit={onEdit} />
    </TableCell>
  );
}

export function invoiceStatusTone(status: "ABERTA" | "FECHADA" | "PAGA"): StatusTone {
  if (status === "PAGA") return "success";
  if (status === "FECHADA") return "warning";
  return "muted";
}

export function debtStatusTone(isPaid: boolean): StatusTone {
  return isPaid ? "success" : "warning";
}

export { columnIcons, formatCurrency, formatDate, formatDueDay, formatMonthYear };
