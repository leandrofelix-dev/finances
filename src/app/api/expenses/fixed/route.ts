import { NextResponse } from "next/server";
import { buildFixedExpenseData } from "@/lib/fixed-expense";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const fixedExpenses = await prisma.fixedExpense.findMany({
      orderBy: { dueDay: "asc" },
      include: {
        category: true,
        payments: {
          where: {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
        },
      },
    });
    return NextResponse.json(fixedExpenses);
  } catch (error) {
    console.error("Error fetching fixed expenses:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = buildFixedExpenseData(body);

    const fixedExpense = await prisma.fixedExpense.create({
      data,
    });

    return NextResponse.json(fixedExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating fixed expense:", error);
    if (error instanceof Error && error.message !== "Internal Server Error") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
