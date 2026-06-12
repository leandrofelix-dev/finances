export type ExpenseRecurrenceType = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY";

type FixedExpensePayload = {
  description?: string;
  amount?: string | number;
  variationMargin?: string | number;
  recurrenceType?: string;
  recurrenceDay?: string | number;
  recurrenceMonth?: string | number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  isActive?: string | boolean;
};

function toInt(value: string | number | undefined) {
  if (value === undefined || value === "") return null;
  return Number.parseInt(String(value), 10);
}

function dateFromParts(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function buildFixedExpenseData(body: FixedExpensePayload) {
  const { description, amount, categoryId } = body;

  if (!description || amount === undefined || !categoryId) {
    throw new Error("Missing required fields");
  }

  const now = new Date();
  const recurrenceType = (body.recurrenceType || "MONTHLY") as ExpenseRecurrenceType;
  const recurrenceDay = toInt(body.recurrenceDay);
  let recurrenceMonth = toInt(body.recurrenceMonth);

  if (recurrenceType === "WEEKLY") {
    if (recurrenceDay === null || recurrenceDay < 0 || recurrenceDay > 6) {
      throw new Error("Invalid recurrence day");
    }
  } else if (recurrenceType === "BIWEEKLY" || recurrenceType === "MONTHLY") {
    if (recurrenceDay === null || recurrenceDay < 1 || recurrenceDay > 31) {
      throw new Error("Invalid recurrence day");
    }
  } else if (recurrenceType === "YEARLY") {
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
  } else {
    throw new Error("Invalid recurrence type");
  }

  if (recurrenceType !== "YEARLY") {
    recurrenceMonth = null;
  }

  const startDate =
    body.startDate ||
    (recurrenceType === "YEARLY"
      ? dateFromParts(now.getFullYear(), recurrenceMonth ?? now.getMonth() + 1, recurrenceDay ?? now.getDate()).toISOString()
      : dateFromParts(now.getFullYear(), now.getMonth() + 1, recurrenceDay ?? now.getDate()).toISOString());

  const dueDay = recurrenceType === "WEEKLY" ? 1 : recurrenceDay ?? 1;

  return {
    description,
    amount: Number.parseFloat(String(amount)),
    variationMargin:
      body.variationMargin !== undefined && body.variationMargin !== ""
        ? Number.parseFloat(String(body.variationMargin))
        : 0,
    dueDay,
    recurrenceType,
    recurrenceDay,
    recurrenceMonth,
    categoryId,
    startDate: new Date(startDate),
    endDate: body.endDate ? new Date(body.endDate) : null,
    isActive: body.isActive !== undefined ? body.isActive === true || body.isActive === "true" : true,
  };
}
