import { prisma } from "@/lib/prisma";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

type MonthRange = {
  start: Date;
  end: Date;
};

type InvoiceRecord = {
  cardId: string;
  realAmount: number;
  status: string;
  month: number;
  year: number;
};

type TransactionRecord = {
  amount: number;
  type: string;
  date: Date;
  cardId: string | null;
  installmentId: string | null;
  categoryId: string | null;
};

type IncomeRecord = {
  amount: number;
  isRecurring: boolean;
  recurrenceType: string;
  recurrenceDay: number | null;
  recurrenceMonth: number | null;
  recurrenceCount: number | null;
  date: Date;
  endDate: Date | null;
};

type RecurringRecord = {
  recurrenceType: string;
  recurrenceDay: number | null;
  recurrenceMonth: number | null;
  date: Date;
};

type FixedExpenseRecord = {
  amount: number;
  variationMargin: number;
  recurrenceType: string;
  recurrenceDay: number | null;
  recurrenceMonth: number | null;
  dueDay: number;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  payments?: Array<{
    isPaid: boolean;
    month: number;
    year: number;
  }>;
};

export type CategoryAllocation = {
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

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getMonthRange(date: Date): MonthRange {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

function clampDay(year: number, month: number, day: number) {
  return Math.min(day, new Date(year, month + 1, 0).getDate());
}

function monthsBetween(start: Date, end: Date) {
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
}

export function installmentNumberForMonth(
  startDate: Date,
  currentInstallment: number,
  monthDate: Date
) {
  return currentInstallment + monthsBetween(startDate, monthDate);
}

function isInMonth(date: Date, month: MonthRange) {
  return date >= month.start && date <= month.end;
}

function installmentPaidToDate(transactions: TransactionRecord[], today: Date) {
  return transactions
    .filter(
      (transaction) =>
        transaction.type === "OUTFLOW" &&
        transaction.installmentId &&
        transaction.date <= today
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function nonInstallmentOutflowToDate(transactions: TransactionRecord[], today: Date) {
  return transactions
    .filter(
      (transaction) =>
        transaction.type === "OUTFLOW" &&
        !transaction.installmentId &&
        transaction.date <= today
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function invoiceRemainingForMonth(
  invoices: InvoiceRecord[],
  transactions: TransactionRecord[],
  month: MonthRange
) {
  return invoices
    .filter(
      (invoice) =>
        invoice.status !== "PAGA" &&
        invoice.month === month.start.getMonth() + 1 &&
        invoice.year === month.start.getFullYear()
    )
    .reduce((sum, invoice) => {
      const cardOutflows = transactions
        .filter(
          (transaction) =>
            transaction.type === "OUTFLOW" &&
            transaction.cardId === invoice.cardId &&
            isInMonth(transaction.date, month)
        )
        .reduce((total, transaction) => total + transaction.amount, 0);

      return sum + Math.max(0, invoice.realAmount - cardOutflows);
    }, 0);
}

function normalizedRecurrenceType(record: RecurringRecord, fallback = "MONTHLY") {
  return record.recurrenceType && record.recurrenceType !== "NONE" ? record.recurrenceType : fallback;
}

function recurringDateForMonth(year: number, month: number, day: number) {
  return new Date(year, month, clampDay(year, month, day), 12, 0, 0, 0);
}

function recurringOccurrenceDatesForMonth(record: RecurringRecord, month: MonthRange, fallback = "MONTHLY") {
  const type = normalizedRecurrenceType(record, fallback);
  const dates: Date[] = [];

  if (type === "WEEKLY") {
    const weekday = record.recurrenceDay ?? record.date.getDay();
    for (let cursor = new Date(month.start); cursor <= month.end; cursor.setDate(cursor.getDate() + 1)) {
      const day = startOfDay(cursor);
      if (day >= startOfDay(record.date) && day.getDay() === weekday) {
        dates.push(new Date(day));
      }
    }
    return dates;
  }

  if (type === "BIWEEKLY") {
    const baseDay = record.recurrenceDay ?? record.date.getDate();
    const year = month.start.getFullYear();
    const monthIndex = month.start.getMonth();
    const days = Array.from(new Set([baseDay, baseDay + 14].map((day) => clampDay(year, monthIndex, day))));
    return days
      .map((day) => recurringDateForMonth(year, monthIndex, day))
      .filter((date) => date >= startOfDay(record.date));
  }

  if (type === "YEARLY") {
    const recurrenceMonth = record.recurrenceMonth ?? record.date.getMonth() + 1;
    if (recurrenceMonth !== month.start.getMonth() + 1) return [];
  }

  const recurrenceDay = record.recurrenceDay ?? record.date.getDate();
  const date = recurringDateForMonth(month.start.getFullYear(), month.start.getMonth(), recurrenceDay);
  return date >= startOfDay(record.date) ? [date] : [];
}

function incomeOccurrenceDatesForMonth(income: IncomeRecord, month: MonthRange) {
  if (!income.isRecurring) {
    return isInMonth(income.date, month) ? [startOfDay(income.date)] : [];
  }

  return recurringOccurrenceDatesForMonth(income, month).filter(
    (date) => !income.endDate || date <= startOfDay(income.endDate)
  );
}

function incomeAmountForMonth(income: IncomeRecord, month: MonthRange) {
  return income.amount * incomeOccurrenceDatesForMonth(income, month).length;
}

function incomeAmountToDate(income: IncomeRecord, month: MonthRange, today: Date) {
  return income.amount * incomeOccurrenceDatesForMonth(income, month).filter(
    (date) => startOfDay(date) <= today
  ).length;
}

function incomeOccursOnDay(income: IncomeRecord, day: Date) {
  return incomeOccurrenceDatesForMonth(income, getMonthRange(day)).some(
    (date) => startOfDay(date).getTime() === startOfDay(day).getTime()
  );
}

function fixedExpenseOccurrenceDatesForMonth(expense: FixedExpenseRecord, month: MonthRange) {
  if (!expense.isActive || expense.startDate > month.end || (expense.endDate && expense.endDate < month.start)) {
    return [];
  }

  return recurringOccurrenceDatesForMonth(
    {
      recurrenceType: expense.recurrenceType,
      recurrenceDay: expense.recurrenceDay ?? expense.dueDay,
      recurrenceMonth: expense.recurrenceMonth,
      date: expense.startDate,
    },
    month
  ).filter((date) => (!expense.endDate || date <= expense.endDate));
}

function fixedExpenseAmount(expense: FixedExpenseRecord) {
  return expense.amount * (1 + expense.variationMargin / 100);
}

function fixedExpenseAmountForMonth(expense: FixedExpenseRecord, month: MonthRange) {
  return fixedExpenseAmount(expense) * fixedExpenseOccurrenceDatesForMonth(expense, month).length;
}

function fixedExpenseIsPaidForMonth(expense: FixedExpenseRecord, month: MonthRange) {
  return Boolean(
    expense.payments?.some(
      (payment) =>
        payment.isPaid &&
        payment.month === month.start.getMonth() + 1 &&
        payment.year === month.start.getFullYear()
    )
  );
}

function fixedExpensePaidAmountForMonth(expense: FixedExpenseRecord, month: MonthRange) {
  return fixedExpenseIsPaidForMonth(expense, month) ? fixedExpenseAmountForMonth(expense, month) : 0;
}

function fixedExpenseOccursOnDay(expense: FixedExpenseRecord, day: Date) {
  if (fixedExpenseIsPaidForMonth(expense, getMonthRange(day))) return false;

  return fixedExpenseOccurrenceDatesForMonth(expense, getMonthRange(day)).some(
    (date) => startOfDay(date).getTime() === startOfDay(day).getTime()
  );
}

export async function getFinancialSnapshot(userId: string, referenceDate = new Date()) {
  const today = startOfDay(referenceDate);
  const month = getMonthRange(today);
  const [incomes, fixedExpenses, installments, transactions, categories, invoices, debts] =
    await Promise.all([
      prisma.income.findMany({
        where: {
          userId,
          OR: [
            {
              isRecurring: true,
              date: { lte: month.end },
              OR: [{ endDate: null }, { endDate: { gte: month.start } }],
            },
            { isRecurring: false, date: { gte: month.start, lte: month.end } },
          ],
        },
        orderBy: { date: "asc" },
      }),
      prisma.fixedExpense.findMany({
        where: {
          userId,
          isActive: true,
          startDate: { lte: month.end },
          OR: [{ endDate: null }, { endDate: { gte: month.start } }],
        },
        include: {
          category: true,
          payments: {
            where: {
              month: month.start.getMonth() + 1,
              year: month.start.getFullYear(),
            },
          },
        },
        orderBy: { dueDay: "asc" },
      }),
      prisma.installment.findMany({
        where: { userId },
        include: { card: true, category: true },
        orderBy: { startDate: "asc" },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: month.start, lte: month.end } },
        include: { category: true, card: true },
        orderBy: { date: "desc" },
      }),
      prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
      prisma.cardInvoice.findMany({
        where: { userId, month: month.start.getMonth() + 1, year: month.start.getFullYear() },
        include: { card: true },
        orderBy: { realAmount: "desc" },
      }),
      prisma.debt.findMany({
        where: {
          userId,
          isPaid: false,
          OR: [
            { isRecurring: true, date: { lte: month.end }, OR: [{ endDate: null }, { endDate: { gte: month.start } }] },
            { isRecurring: false, date: { gte: month.start, lte: month.end } },
          ],
        },
        include: { category: true },
        orderBy: { date: "asc" },
      }),
    ]);

  const spendableIncome = incomes
    .reduce((sum, income) => sum + incomeAmountForMonth(income, month), 0);
  const incomeToDate = incomes
    .reduce((sum, income) => sum + incomeAmountToDate(income, month, today), 0);
  const incomeRemaining = Math.max(0, spendableIncome - incomeToDate);
  const fixedProjected = fixedExpenses.reduce(
    (sum, expense) => sum + fixedExpenseAmountForMonth(expense, month),
    0
  );
  const fixedPaid = fixedExpenses.reduce(
    (sum, expense) => sum + fixedExpensePaidAmountForMonth(expense, month),
    0
  );
  const fixedRemaining = Math.max(0, fixedProjected - fixedPaid);
  const monthlyInstallments = installments
    .map((installment) => ({
      ...installment,
      installmentNumber: installmentNumberForMonth(
        installment.startDate,
        installment.currentInstallment,
        month.start
      ),
    }))
    .filter(
      (installment) =>
        installment.installmentNumber >= installment.currentInstallment &&
        installment.installmentNumber <= installment.totalInstallments
    );
  const installmentProjected = monthlyInstallments.reduce(
    (sum, installment) => sum + installment.amountPerInstallment,
    0
  );
  const monthlyDebts = debts.filter((debt) => {
    if (!debt.isRecurring) {
      return debt.date >= month.start && debt.date <= month.end;
    }

    return debt.date <= month.end && (!debt.endDate || debt.endDate >= month.start);
  });
  const debtProjected = monthlyDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const outflowToDate = transactions
    .filter((transaction) => transaction.type === "OUTFLOW" && transaction.date <= today)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const inflowTransactions = transactions
    .filter((transaction) => transaction.type === "INFLOW")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const inflowTransactionsToDate = transactions
    .filter((transaction) => transaction.type === "INFLOW" && transaction.date <= today)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const inflowTransactionsRemaining = Math.max(0, inflowTransactions - inflowTransactionsToDate);

  const installmentPaid = installmentPaidToDate(transactions, today);
  const remainingInstallment = Math.max(0, installmentProjected - installmentPaid);
  const invoiceProjected = invoiceRemainingForMonth(invoices, transactions, month);

  const daysRemaining = Math.max(1, Math.ceil((month.end.getTime() - today.getTime()) / MS_PER_DAY));
  const nonInstallmentOutflow = nonInstallmentOutflowToDate(transactions, today);
  const healthyDailySpend =
    (spendableIncome -
      fixedRemaining -
      remainingInstallment -
      debtProjected -
      invoiceProjected -
      nonInstallmentOutflow +
      inflowTransactions) /
    daysRemaining;

  const categoryAllocations: CategoryAllocation[] = categories.map((category) => {
    const directSpent = transactions
      .filter(
        (transaction) =>
          transaction.type === "OUTFLOW" &&
          transaction.categoryId === category.id &&
          !transaction.installmentId
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const committedFixed = fixedExpenses
      .filter((expense) => expense.categoryId === category.id)
      .reduce((sum, expense) => sum + fixedExpenseAmountForMonth(expense, month), 0);
    const committedInstallments = monthlyInstallments
      .filter((installment) => installment.categoryId === category.id)
      .reduce((sum, installment) => sum + installment.amountPerInstallment, 0);
    const committedDebts = monthlyDebts
      .filter((debt) => debt.categoryId === category.id)
      .reduce((sum, debt) => sum + debt.amount, 0);
    const committed = committedFixed + committedInstallments + committedDebts;
    const spent = directSpent + committed;
    const target =
      category.maxLimit ?? (category.allocationPercentage ? spendableIncome * (category.allocationPercentage / 100) : 0);
    const remaining = target > 0 ? target - spent : null;

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      target,
      spent,
      committed,
      remaining,
      dailyAllowance: remaining === null ? null : remaining / daysRemaining,
      usage: target > 0 ? Math.min(100, (spent / target) * 100) : 0,
    };
  });

  const balanceNow = incomeToDate + inflowTransactionsToDate - outflowToDate - fixedPaid;
  const projectedMonthEnd =
    balanceNow +
    incomeRemaining +
    inflowTransactionsRemaining -
    fixedRemaining -
    remainingInstallment -
    debtProjected -
    invoiceProjected;

  return {
    month,
    daysRemaining,
    spendableIncome,
    incomeToDate: incomeToDate + inflowTransactionsToDate,
    fixedProjected,
    fixedPaid,
    fixedRemaining,
    installmentProjected,
    remainingInstallment,
    debtProjected,
    invoiceProjected,
    outflowToDate,
    healthyDailySpend,
    balanceNow,
    projectedMonthEnd,
    categories,
    categoryAllocations,
    fixedExpenses,
    installments,
    monthlyInstallments,
    monthlyDebts,
    transactions,
    invoices,
  };
}

export type MonthlyCashflowPoint = {
  month: string;
  income: number;
  expense: number;
};

function incomeForMonth(
  incomes: Awaited<ReturnType<typeof prisma.income.findMany>>,
  month: MonthRange
) {
  return incomes
    .reduce((sum, income) => sum + incomeAmountForMonth(income, month), 0);
}

function fixedForMonth(
  fixedExpenses: Awaited<ReturnType<typeof prisma.fixedExpense.findMany>>,
  month: MonthRange
) {
  return fixedExpenses
    .reduce((sum, expense) => sum + fixedExpenseAmountForMonth(expense, month), 0);
}

function installmentsForMonth(
  installments: Awaited<ReturnType<typeof prisma.installment.findMany>>,
  month: MonthRange
) {
  return installments
    .map((installment) => ({
      ...installment,
      installmentNumber: installmentNumberForMonth(
        installment.startDate,
        installment.currentInstallment,
        month.start
      ),
    }))
    .filter(
      (installment) =>
        installment.installmentNumber >= installment.currentInstallment &&
        installment.installmentNumber <= installment.totalInstallments
    )
    .reduce((sum, installment) => sum + installment.amountPerInstallment, 0);
}

function debtsForMonth(
  debts: Awaited<ReturnType<typeof prisma.debt.findMany>>,
  month: MonthRange
) {
  return debts
    .filter((debt) => {
      if (!debt.isRecurring) {
        return debt.date >= month.start && debt.date <= month.end;
      }

      return debt.date <= month.end && (!debt.endDate || debt.endDate >= month.start);
    })
    .reduce((sum, debt) => sum + debt.amount, 0);
}

export async function getMonthlyCashflow(userId: string, months = 12, referenceDate = new Date()) {
  const today = startOfDay(referenceDate);
  const [incomes, fixedExpenses, installments, transactions, debts, invoices] = await Promise.all([
    prisma.income.findMany({ where: { userId }, orderBy: { date: "asc" } }),
    prisma.fixedExpense.findMany({ where: { userId, isActive: true }, include: { category: true, payments: true } }),
    prisma.installment.findMany({ where: { userId }, include: { card: true, category: true } }),
    prisma.transaction.findMany({ where: { userId }, orderBy: { date: "asc" } }),
    prisma.debt.findMany({ where: { userId, isPaid: false }, include: { category: true } }),
    prisma.cardInvoice.findMany({ where: { userId }, include: { card: true } }),
  ]);

  const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" });
  const points: MonthlyCashflowPoint[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const month = getMonthRange(monthDate);
    const monthTransactions = transactions.filter((transaction) => isInMonth(transaction.date, month));

    const income =
      incomeForMonth(incomes, month) +
      monthTransactions
        .filter((transaction) => transaction.type === "INFLOW")
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const nonInstallmentOutflow = monthTransactions
      .filter((transaction) => transaction.type === "OUTFLOW" && !transaction.installmentId)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expense =
      nonInstallmentOutflow +
      installmentsForMonth(installments, month) +
      fixedForMonth(fixedExpenses, month) +
      debtsForMonth(debts, month) +
      invoiceRemainingForMonth(invoices, monthTransactions, month);

    points.push({
      month: formatter.format(month.start),
      income,
      expense,
    });
  }

  return points;
}

export async function buildProjection(userId: string, targetDate: Date, referenceDate = new Date()) {
  const today = startOfDay(referenceDate);
  const end = startOfDay(targetDate);
  if (end < today) {
    throw new Error("Target date must be today or in the future");
  }

  const snapshot = await getFinancialSnapshot(userId, referenceDate);
  const monthStart = getMonthRange(today).start;
  const [incomes, fixedExpenses, installments, transactions, debts, invoices] = await Promise.all([
    prisma.income.findMany({ where: { userId }, orderBy: { date: "asc" } }),
    prisma.fixedExpense.findMany({ where: { userId, isActive: true }, include: { category: true, payments: true } }),
    prisma.installment.findMany({ where: { userId }, include: { card: true, category: true } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: end } },
      include: { category: true, card: true },
    }),
    prisma.debt.findMany({ where: { userId, isPaid: false }, include: { category: true } }),
    prisma.cardInvoice.findMany({ where: { userId }, include: { card: true } }),
  ]);

  let balance = snapshot.balanceNow;
  const points = [{ date: today.toISOString(), balance }];
  const events = [];
  const processedInvoices = new Set<string>();

  for (let cursor = new Date(today); cursor < end;) {
    cursor.setDate(cursor.getDate() + 1);
    const day = new Date(cursor);
    const dayEvents = [];
    const month = getMonthRange(day);

    for (const income of incomes) {
      if (incomeOccursOnDay(income, day)) {
        balance += income.amount;
        dayEvents.push({ type: "income", label: income.description, amount: income.amount });
      }
    }

    for (const expense of fixedExpenses) {
      if (fixedExpenseOccursOnDay(expense, day)) {
        const amount = fixedExpenseAmount(expense);
        balance -= amount;
        dayEvents.push({ type: "fixed", label: expense.description, amount: -amount });
      }
    }

    for (const installment of installments) {
      const number = installmentNumberForMonth(
        installment.startDate,
        installment.currentInstallment,
        new Date(day.getFullYear(), day.getMonth(), 1)
      );
      const dueDay = clampDay(day.getFullYear(), day.getMonth(), installment.card.dueDay);
      const hasInstallmentTxInMonth = transactions.some(
        (transaction) =>
          transaction.installmentId === installment.id &&
          transaction.date.getMonth() === day.getMonth() &&
          transaction.date.getFullYear() === day.getFullYear()
      );

      if (
        !hasInstallmentTxInMonth &&
        number >= installment.currentInstallment &&
        number <= installment.totalInstallments &&
        day.getDate() === dueDay
      ) {
        balance -= installment.amountPerInstallment;
        dayEvents.push({
          type: "installment",
          label: `${installment.description} (${number}/${installment.totalInstallments})`,
          amount: -installment.amountPerInstallment,
        });
      }
    }

    for (const debt of debts) {
      const debtDay = debt.dueDay ?? debt.date.getDate();
      const recurringDueDay = clampDay(day.getFullYear(), day.getMonth(), debtDay);
      const isRecurringDebt =
        debt.isRecurring &&
        debt.date <= day &&
        (!debt.endDate || debt.endDate >= day) &&
        day.getDate() === recurringDueDay;
      const isSingleDebt = !debt.isRecurring && startOfDay(debt.date).getTime() === day.getTime();

      if (isRecurringDebt || isSingleDebt) {
        balance -= debt.amount;
        dayEvents.push({ type: "debt", label: debt.description, amount: -debt.amount });
      }
    }

    for (const invoice of invoices) {
      if (
        invoice.status === "PAGA" ||
        processedInvoices.has(invoice.id) ||
        invoice.month !== month.start.getMonth() + 1 ||
        invoice.year !== month.start.getFullYear()
      ) {
        continue;
      }

      const dueDay = clampDay(day.getFullYear(), day.getMonth(), invoice.card.dueDay);
      if (day.getDate() !== dueDay) {
        continue;
      }

      const cardOutflows = transactions
        .filter(
          (transaction) =>
            transaction.type === "OUTFLOW" &&
            transaction.cardId === invoice.cardId &&
            isInMonth(transaction.date, month)
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);
      const remaining = Math.max(0, invoice.realAmount - cardOutflows);

      if (remaining > 0) {
        balance -= remaining;
        processedInvoices.add(invoice.id);
        dayEvents.push({
          type: "invoice",
          label: `Fatura ${invoice.card.name}`,
          amount: -remaining,
        });
      }
    }

    for (const transaction of transactions) {
      if (startOfDay(transaction.date).getTime() === day.getTime()) {
        const amount = transaction.type === "INFLOW" ? transaction.amount : -transaction.amount;
        balance += amount;
        dayEvents.push({ type: "transaction", label: transaction.description, amount });
      }
    }

    if (dayEvents.length > 0) {
      events.push({ date: day.toISOString(), events: dayEvents });
    }
    points.push({ date: day.toISOString(), balance });
  }

  const installmentEndings = installments.map((installment) => {
    const remainingMonths = installment.totalInstallments - installment.currentInstallment;
    const ending = new Date(installment.startDate);
    ending.setMonth(ending.getMonth() + remainingMonths);
    return {
      id: installment.id,
      description: installment.description,
      card: installment.card.name,
      endsAt: ending.toISOString(),
      totalInstallments: installment.totalInstallments,
    };
  });

  return {
    targetDate: end.toISOString(),
    projectedBalance: balance,
    points,
    events,
    installmentEndings,
  };
}

export type CalendarDayItem = {
  id: string;
  type:
    | "income"
    | "transaction_inflow"
    | "transaction_outflow"
    | "fixed_expense"
    | "installment"
    | "debt"
    | "invoice";
  label: string;
  amount: number;
  category?: { name: string; color: string } | null;
  card?: { name: string; color: string } | null;
  source: "income" | "transaction" | "fixed_expense" | "installment" | "debt" | "invoice";
};

export type CalendarDaySummary = {
  date: string;
  income: number;
  expense: number;
  balance: number;
  items: CalendarDayItem[];
};

export type CalendarMonthData = {
  year: number;
  month: number;
  days: CalendarDaySummary[];
  totals: { income: number; expense: number; balance: number };
};

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function toDateKeyFromDb(date: Date) {
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function toDateKeyFromLocal(date: Date) {
  return toDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

const calendarItemTypeOrder: Record<CalendarDayItem["type"], number> = {
  income: 0,
  transaction_inflow: 1,
  transaction_outflow: 2,
  fixed_expense: 3,
  installment: 4,
  debt: 5,
  invoice: 6,
};

export async function getCalendarMonth(userId: string, year: number, month: number): Promise<CalendarMonthData> {
  const monthDate = new Date(year, month - 1, 1);
  const monthRange = getMonthRange(monthDate);

  const [incomes, fixedExpenses, installments, transactions, debts, invoices] = await Promise.all([
    prisma.income.findMany({
      where: {
        userId,
        OR: [
          {
            isRecurring: true,
            date: { lte: monthRange.end },
            OR: [{ endDate: null }, { endDate: { gte: monthRange.start } }],
          },
          { isRecurring: false, date: { gte: monthRange.start, lte: monthRange.end } },
        ],
      },
      orderBy: { date: "asc" },
    }),
    prisma.fixedExpense.findMany({
      where: { userId, isActive: true },
      include: { category: true, payments: true },
      orderBy: { startDate: "asc" },
    }),
    prisma.installment.findMany({
      where: { userId },
      include: { card: true, category: true },
      orderBy: { startDate: "asc" },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: monthRange.start, lte: monthRange.end },
      },
      include: { category: true, card: true },
      orderBy: { date: "asc" },
    }),
    prisma.debt.findMany({
      where: { userId, isPaid: false },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
    prisma.cardInvoice.findMany({
      where: { userId, month, year },
      include: { card: true },
    }),
  ]);

  const daysMap = new Map<string, CalendarDaySummary>();
  const processedInvoices = new Set<string>();

  function ensureDay(dateKey: string) {
    const existing = daysMap.get(dateKey);
    if (existing) return existing;

    const summary: CalendarDaySummary = {
      date: dateKey,
      income: 0,
      expense: 0,
      balance: 0,
      items: [],
    };
    daysMap.set(dateKey, summary);
    return summary;
  }

  function addExpense(dateKey: string, item: CalendarDayItem) {
    const day = ensureDay(dateKey);
    day.expense += item.amount;
    day.items.push(item);
  }

  for (let dayNumber = 1; dayNumber <= monthRange.end.getDate(); dayNumber++) {
    const day = new Date(year, month - 1, dayNumber, 12, 0, 0, 0);
    const dateKey = toDateKeyFromLocal(day);

    for (const income of incomes) {
      if (!incomeOccursOnDay(income, day)) continue;

      const summary = ensureDay(dateKey);
      summary.income += income.amount;
      summary.items.push({
        id: `income-${income.id}-${dateKey}`,
        type: "income",
        label: income.description,
        amount: income.amount,
        source: "income",
      });
    }

    for (const expense of fixedExpenses) {
      if (!fixedExpenseOccursOnDay(expense, day)) continue;

      const amount = fixedExpenseAmount(expense);
      addExpense(dateKey, {
        id: `fixed-${expense.id}-${dateKey}`,
        type: "fixed_expense",
        label: expense.description,
        amount,
        category: { name: expense.category.name, color: expense.category.color },
        source: "fixed_expense",
      });
    }

    for (const installment of installments) {
      const installmentNumber = installmentNumberForMonth(
        installment.startDate,
        installment.currentInstallment,
        new Date(day.getFullYear(), day.getMonth(), 1)
      );
      const dueDay = clampDay(day.getFullYear(), day.getMonth(), installment.card.dueDay);
      const hasInstallmentTxInMonth = transactions.some(
        (transaction) =>
          transaction.installmentId === installment.id &&
          transaction.date.getMonth() === day.getMonth() &&
          transaction.date.getFullYear() === day.getFullYear()
      );

      if (
        hasInstallmentTxInMonth ||
        installmentNumber < installment.currentInstallment ||
        installmentNumber > installment.totalInstallments ||
        day.getDate() !== dueDay
      ) {
        continue;
      }

      addExpense(dateKey, {
        id: `installment-${installment.id}-${dateKey}`,
        type: "installment",
        label: `${installment.description} (${installmentNumber}/${installment.totalInstallments})`,
        amount: installment.amountPerInstallment,
        category: { name: installment.category.name, color: installment.category.color },
        card: { name: installment.card.name, color: installment.card.color },
        source: "installment",
      });
    }

    for (const debt of debts) {
      const debtDay = debt.dueDay ?? debt.date.getUTCDate();
      const recurringDueDay = clampDay(day.getFullYear(), day.getMonth(), debtDay);
      const isRecurringDebt =
        debt.isRecurring &&
        debt.date <= day &&
        (!debt.endDate || debt.endDate >= day) &&
        day.getDate() === recurringDueDay;
      const isSingleDebt =
        !debt.isRecurring && toDateKeyFromDb(debt.date) === dateKey;

      if (!isRecurringDebt && !isSingleDebt) continue;

      addExpense(dateKey, {
        id: `debt-${debt.id}-${dateKey}`,
        type: "debt",
        label: debt.description,
        amount: debt.amount,
        category: debt.category
          ? { name: debt.category.name, color: debt.category.color }
          : null,
        source: "debt",
      });
    }

    for (const invoice of invoices) {
      if (processedInvoices.has(invoice.id)) continue;

      const dueDay = clampDay(day.getFullYear(), day.getMonth(), invoice.card.dueDay);
      if (day.getDate() !== dueDay) continue;

      processedInvoices.add(invoice.id);
      addExpense(dateKey, {
        id: `invoice-${invoice.id}-${dateKey}`,
        type: "invoice",
        label:
          invoice.status === "PAGA"
            ? `Fatura ${invoice.card.name} (paga)`
            : `Fatura ${invoice.card.name}`,
        amount: invoice.realAmount,
        card: { name: invoice.card.name, color: invoice.card.color },
        source: "invoice",
      });
    }

    for (const transaction of transactions) {
      if (toDateKeyFromDb(transaction.date) !== dateKey) continue;

      const summary = ensureDay(dateKey);
      const isInflow = transaction.type === "INFLOW";

      if (isInflow) {
        summary.income += transaction.amount;
        summary.items.push({
          id: transaction.id,
          type: "transaction_inflow",
          label: transaction.description,
          amount: transaction.amount,
          category: transaction.category
            ? { name: transaction.category.name, color: transaction.category.color }
            : null,
          card: transaction.card ? { name: transaction.card.name, color: transaction.card.color } : null,
          source: "transaction",
        });
        continue;
      }

      summary.expense += transaction.amount;
      summary.items.push({
        id: transaction.id,
        type: "transaction_outflow",
        label: transaction.description,
        amount: transaction.amount,
        category: transaction.category
          ? { name: transaction.category.name, color: transaction.category.color }
          : null,
        card: transaction.card ? { name: transaction.card.name, color: transaction.card.color } : null,
        source: "transaction",
      });
    }
  }

  const days = Array.from(daysMap.values())
    .map((day) => ({
      ...day,
      balance: day.income - day.expense,
      items: day.items.sort(
        (left, right) => calendarItemTypeOrder[left.type] - calendarItemTypeOrder[right.type]
      ),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));

  const totals = days.reduce(
    (acc, day) => ({
      income: acc.income + day.income,
      expense: acc.expense + day.expense,
      balance: acc.balance + day.balance,
    }),
    { income: 0, expense: 0, balance: 0 }
  );

  return { year, month, days, totals };
}
