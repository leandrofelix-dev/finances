export type IncomeRecurrenceType = "NONE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";

type IncomePayload = {
  description?: string;
  amount?: string | number;
  isRecurring?: string | boolean;
  recurrenceType?: string;
  recurrenceDay?: string | number;
  recurrenceMonth?: string | number;
  recurrenceCount?: string | number;
  durationType?: string;
  date?: string;
  endDate?: string;
};

function toInt(value: string | number | undefined) {
  if (value === undefined || value === "") return null;
  return Number.parseInt(String(value), 10);
}

function dateFromParts(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function clampDay(year: number, monthIndex: number, day: number) {
  return Math.min(day, new Date(year, monthIndex + 1, 0).getDate());
}

function addOccurrences(start: Date, type: IncomeRecurrenceType, count: number) {
  const occurrenceIndex = Math.max(0, count - 1);
  const result = new Date(start);

  if (type === "WEEKLY") {
    result.setDate(result.getDate() + occurrenceIndex * 7);
    return result;
  }

  if (type === "BIWEEKLY") {
    result.setDate(result.getDate() + occurrenceIndex * 14);
    return result;
  }

  if (type === "YEARLY") {
    result.setFullYear(result.getFullYear() + occurrenceIndex);
    return result;
  }

  const targetMonth = result.getMonth() + occurrenceIndex;
  const year = result.getFullYear() + Math.floor(targetMonth / 12);
  const monthIndex = targetMonth % 12;
  return new Date(year, monthIndex, clampDay(year, monthIndex, start.getDate()), 12, 0, 0, 0);
}

export function buildIncomeData(body: IncomePayload) {
  const {
    description,
    amount,
  } = body;

  if (!description || amount === undefined) {
    throw new Error("Missing required fields");
  }

  const now = new Date();
  const formRecurring = body.isRecurring === true || body.isRecurring === "true";
  const recurrenceType = (formRecurring ? body.recurrenceType : "NONE") as IncomeRecurrenceType;
  const normalizedType = recurrenceType && recurrenceType !== "NONE" ? recurrenceType : "NONE";
  const isRecurring = normalizedType !== "NONE";
  let recurrenceDay: number | null = null;
  let recurrenceMonth: number | null = null;
  let recurrenceCount: number | null = null;
  let endDate: Date | null = null;
  let date: Date;

  if (!isRecurring) {
    if (!body.date) throw new Error("Missing required fields");
    date = new Date(body.date);
  } else if (normalizedType === "WEEKLY") {
    recurrenceDay = toInt(body.recurrenceDay);
    if (recurrenceDay === null || recurrenceDay < 0 || recurrenceDay > 6) {
      throw new Error("Invalid recurrence day");
    }
    date = body.date ? new Date(body.date) : dateFromParts(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (normalizedType === "BIWEEKLY" || normalizedType === "MONTHLY") {
    recurrenceDay = toInt(body.recurrenceDay);
    if (recurrenceDay === null || recurrenceDay < 1 || recurrenceDay > 31) {
      throw new Error("Invalid recurrence day");
    }
    if (body.date) {
      const startDate = new Date(body.date);
      date = dateFromParts(startDate.getFullYear(), startDate.getMonth() + 1, recurrenceDay);
    } else {
      date = dateFromParts(now.getFullYear(), now.getMonth() + 1, recurrenceDay);
    }
  } else if (normalizedType === "YEARLY") {
    recurrenceDay = toInt(body.recurrenceDay);
    recurrenceMonth = toInt(body.recurrenceMonth);
    if (
      recurrenceDay === null ||
      recurrenceDay < 1 ||
      recurrenceDay > 31 ||
      recurrenceMonth === null ||
      recurrenceMonth < 1 ||
      recurrenceMonth > 12
    ) {
      throw new Error("Invalid yearly recurrence");
    }
    const year = body.date ? new Date(body.date).getFullYear() : now.getFullYear();
    date = dateFromParts(year, recurrenceMonth, recurrenceDay);
  } else {
    throw new Error("Invalid recurrence type");
  }

  if (isRecurring) {
    recurrenceCount = toInt(body.recurrenceCount);
    const hasCountLimit = recurrenceCount !== null && recurrenceCount > 0;
    const hasDateLimit = Boolean(body.endDate);

    if (hasCountLimit) {
      endDate = addOccurrences(date, normalizedType, recurrenceCount as number);
    } else if (hasDateLimit) {
      endDate = new Date(body.endDate as string);
    }

    if (endDate && endDate < date) {
      throw new Error("Invalid recurrence end date");
    }
  }

  return {
    description,
    amount: Number.parseFloat(String(amount)),
    isRecurring,
    recurrenceType: normalizedType,
    recurrenceDay,
    recurrenceMonth,
    recurrenceCount,
    date,
    endDate,
  };
}

export function recurrenceLabel(income: {
  isRecurring: boolean;
  recurrenceType?: string | null;
  recurrenceDay?: number | null;
  recurrenceMonth?: number | null;
  recurrenceCount?: number | null;
  date: string | Date;
  endDate?: string | Date | null;
}) {
  if (!income.isRecurring) return "Isolada";

  const type = income.recurrenceType ?? "MONTHLY";
  const day = income.recurrenceDay ?? new Date(income.date).getDate();
  const month = income.recurrenceMonth ?? new Date(income.date).getMonth() + 1;

  let label = `Mensal · dia ${day}`;

  if (type === "WEEKLY") {
    const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    label = `Semanal · ${weekdays[day] ?? "dia inválido"}`;
  } else if (type === "BIWEEKLY") {
    label = `Quinzenal · dias ${day} e ${Math.min(day + 14, 31)}`;
  } else if (type === "YEARLY") {
    label = `Anual · ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
  }

  if (income.recurrenceCount) return `${label} · ${income.recurrenceCount}x`;
  if (income.endDate) return `${label} · até ${new Date(income.endDate).toLocaleDateString("pt-BR")}`;
  return `${label} · permanente`;
}
