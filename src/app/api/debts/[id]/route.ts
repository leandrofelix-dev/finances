import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description, amount, isRecurring, date, dueDay, categoryId, endDate, isPaid } = body;

    if (!description || amount === undefined || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const recurring = isRecurring === true || isRecurring === "true";

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const debt = await prisma.debt.update({
      where: { id, userId: user.id },
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

    return NextResponse.json(debt);
  } catch (error) {
    console.error("Error updating debt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await prisma.debt.delete({ where: { id, userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting debt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
