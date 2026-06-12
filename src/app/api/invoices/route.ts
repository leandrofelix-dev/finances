import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.cardInvoice.findMany({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: {
        card: true,
      },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching card invoices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardId, month, year, realAmount, status, isPaid } = body;

    if (!cardId || month === undefined || year === undefined || realAmount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const invoiceStatus = status ?? (isPaid === true || isPaid === "true" ? "PAGA" : "ABERTA");

    const invoice = await prisma.cardInvoice.upsert({
      where: {
        cardId_month_year: {
          cardId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      update: {
        realAmount: parseFloat(realAmount),
        status: invoiceStatus,
      },
      create: {
        cardId,
        month: parseInt(month),
        year: parseInt(year),
        realAmount: parseFloat(realAmount),
        status: invoiceStatus,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error upserting card invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
