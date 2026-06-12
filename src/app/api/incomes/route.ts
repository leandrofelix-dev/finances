import { NextResponse } from "next/server";
import { buildIncomeData } from "@/lib/income";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(incomes);
  } catch (error) {
    console.error("Error fetching incomes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = buildIncomeData(body);

    const income = await prisma.income.create({
      data,
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error("Error creating income:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
