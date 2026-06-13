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
    const { description, totalAmount, totalInstallments, currentInstallment, startDate, cardId, categoryId } = body;

    if (!description || totalAmount === undefined || !totalInstallments || !startDate || !cardId || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tAmount = parseFloat(totalAmount);
    const tInstallments = parseInt(totalInstallments);
    const curInstallment = currentInstallment !== undefined && currentInstallment !== "" ? parseInt(currentInstallment) : 1;
    const amtPerInstallment = tAmount / tInstallments;

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const installment = await prisma.installment.update({
      where: { id, userId: user.id },
      data: {
        description,
        totalAmount: tAmount,
        totalInstallments: tInstallments,
        currentInstallment: curInstallment,
        amountPerInstallment: amtPerInstallment,
        startDate: new Date(startDate),
        cardId,
        categoryId,
      },
    });

    return NextResponse.json(installment);
  } catch (error) {
    console.error("Error updating installment:", error);
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

    await prisma.installment.delete({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting installment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
