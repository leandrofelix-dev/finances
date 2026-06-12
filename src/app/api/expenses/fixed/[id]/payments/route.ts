import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return Number.parseInt(String(value), 10);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const now = new Date();
    const month = toInt(body.month) ?? now.getMonth() + 1;
    const year = toInt(body.year) ?? now.getFullYear();
    const isPaid = body.isPaid === true || body.isPaid === "true";

    if (month < 1 || month > 12 || year < 2000) {
      return NextResponse.json({ error: "Invalid payment period" }, { status: 400 });
    }

    const payment = await prisma.fixedExpensePayment.upsert({
      where: {
        fixedExpenseId_month_year: {
          fixedExpenseId: id,
          month,
          year,
        },
      },
      create: {
        fixedExpenseId: id,
        month,
        year,
        isPaid,
        paidAt: isPaid ? new Date() : null,
      },
      update: {
        isPaid,
        paidAt: isPaid ? new Date() : null,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error updating fixed expense payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
