import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { cardId, month, year, realAmount, status } = body;

    if (!cardId || month === undefined || year === undefined || realAmount === undefined || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const invoice = await prisma.cardInvoice.update({
      where: { id },
      data: {
        cardId,
        month: parseInt(month),
        year: parseInt(year),
        realAmount: parseFloat(realAmount),
        status,
      },
      include: { card: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating card invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.cardInvoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
