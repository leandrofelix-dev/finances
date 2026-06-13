import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoices = await prisma.cardInvoice.findMany({
      where: { userId: user.id },
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

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const card = await prisma.card.findUnique({ where: { id: cardId, userId: user.id } });
    if (!card) return NextResponse.json({ error: "Card Not Found" }, { status: 404 });

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
        userId: user.id,
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
