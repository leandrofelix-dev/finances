import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const debts = await prisma.debt.findMany({
      include: { category: true },
      orderBy: [{ isPaid: "asc" }, { date: "asc" }],
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, amount, isRecurring, date, dueDay, categoryId, endDate, isPaid } = body;

    if (!description || amount === undefined || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const recurring = isRecurring === true || isRecurring === "true";

    const debt = await prisma.debt.create({
      data: {
        description,
        amount: parseFloat(amount),
        isRecurring: recurring,
        date: new Date(date),
        dueDay: recurring && dueDay !== undefined && dueDay !== "" ? parseInt(dueDay) : null,
        categoryId: categoryId || null,
        endDate: endDate ? new Date(endDate) : null,
        isPaid: isPaid === true || isPaid === "true",
      },
      include: { category: true },
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    console.error("Error creating debt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
