const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

export function formatMonthYear(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${year}`;
}

export function formatDueDay(day: number) {
  return `Dia ${day}`;
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
