import { NextResponse } from "next/server";
import { buildFixedExpenseData } from "@/lib/fixed-expense";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = buildFixedExpenseData(body);

    const fixedExpense = await prisma.fixedExpense.update({
      where: { id },
      data,
    });

    return NextResponse.json(fixedExpense);
  } catch (error) {
    console.error("Error updating fixed expense:", error);
    if (error instanceof Error && error.message !== "Internal Server Error") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.fixedExpense.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fixed expense:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
