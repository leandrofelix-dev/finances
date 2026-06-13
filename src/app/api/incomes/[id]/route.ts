import { NextResponse } from "next/server";
import { buildIncomeData } from "@/lib/income";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = buildIncomeData(body);

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const income = await prisma.income.update({
      where: { id, userId: user.id },
      data,
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error("Error updating income:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.income.delete({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
