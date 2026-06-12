import { NextResponse } from "next/server";
import { hrefForTab, type DashboardTab } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";

type SearchResult = {
  id: string;
  label: string;
  sublabel?: string;
  tab: DashboardTab;
  href: string;
};

function item(id: string, label: string, tab: DashboardTab, sublabel?: string): SearchResult {
  return { id, label, sublabel, tab, href: hrefForTab(tab) };
}

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase();
    if (!query) {
      return NextResponse.json([]);
    }

    const contains = { contains: query, mode: "insensitive" as const };

    const [
      transactions,
      categories,
      incomes,
      cards,
      fixedExpenses,
      installments,
      invoices,
      debts,
    ] = await Promise.all([
      prisma.transaction.findMany({
        where: { description: contains },
        take: 6,
        orderBy: { date: "desc" },
        include: { category: true },
      }),
      prisma.category.findMany({
        where: { name: contains },
        take: 6,
        orderBy: { name: "asc" },
      }),
      prisma.income.findMany({
        where: { description: contains },
        take: 6,
        orderBy: { date: "desc" },
      }),
      prisma.card.findMany({
        where: { name: contains },
        take: 6,
        orderBy: { name: "asc" },
      }),
      prisma.fixedExpense.findMany({
        where: { description: contains },
        take: 6,
        orderBy: { dueDay: "asc" },
        include: { category: true },
      }),
      prisma.installment.findMany({
        where: { description: contains },
        take: 6,
        orderBy: { startDate: "desc" },
        include: { card: true },
      }),
      prisma.cardInvoice.findMany({
        where: { card: { name: contains } },
        take: 6,
        orderBy: [{ year: "desc" }, { month: "desc" }],
        include: { card: true },
      }),
      prisma.debt.findMany({
        where: { description: contains },
        take: 6,
        orderBy: { date: "desc" },
        include: { category: true },
      }),
    ]);

    const results: SearchResult[] = [
      ...transactions.map((transaction) =>
        item(
          `tx-${transaction.id}`,
          transaction.description,
          "transactions",
          transaction.category?.name ?? (transaction.type === "INFLOW" ? "Entrada" : "Compra")
        )
      ),
      ...categories.map((category) =>
        item(`cat-${category.id}`, category.name, "categories", "Categoria")
      ),
      ...incomes.map((income) =>
        item(`income-${income.id}`, income.description, "incomes", "Entrada")
      ),
      ...cards.map((card) => item(`card-${card.id}`, card.name, "cards", "Cartão")),
      ...fixedExpenses.map((expense) =>
        item(
          `fixed-${expense.id}`,
          expense.description,
          "fixed",
          expense.category.name
        )
      ),
      ...installments.map((installment) =>
        item(
          `installment-${installment.id}`,
          installment.description,
          "installments",
          installment.card.name
        )
      ),
      ...invoices.map((invoice) =>
        item(
          `invoice-${invoice.id}`,
          `${invoice.card.name} ${String(invoice.month).padStart(2, "0")}/${invoice.year}`,
          "invoices",
          invoice.status
        )
      ),
      ...debts.map((debt) =>
        item(
          `debt-${debt.id}`,
          debt.description,
          "debts",
          debt.category?.name ?? "Dívida"
        )
      ),
    ];

    return NextResponse.json(results.slice(0, 12));
  } catch (error) {
    console.error("Error searching records:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
