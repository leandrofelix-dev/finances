import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const installments = await prisma.installment.findMany({
      orderBy: { startDate: "desc" },
      include: {
        card: true,
        category: true,
      },
    });
    return NextResponse.json(installments);
  } catch (error) {
    console.error("Error fetching installments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, totalAmount, totalInstallments, currentInstallment, startDate, cardId, categoryId } = body;

    if (!description || totalAmount === undefined || !totalInstallments || !startDate || !cardId || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tAmount = parseFloat(totalAmount);
    const tInstallments = parseInt(totalInstallments);
    const curInstallment = currentInstallment !== undefined && currentInstallment !== "" ? parseInt(currentInstallment) : 1;
    const amtPerInstallment = tAmount / tInstallments;

    const installment = await prisma.installment.create({
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

    // Optionally generate a transaction for the current installment month
    // if the user wants it to immediately register in this month's transactions
    // Let's create it dynamically
    const installmentName = `${description} (Parcela ${curInstallment}/${tInstallments})`;
    await prisma.transaction.create({
      data: {
        description: installmentName,
        amount: amtPerInstallment,
        type: "OUTFLOW",
        date: new Date(startDate),
        categoryId,
        cardId,
        installmentId: installment.id,
      },
    });

    return NextResponse.json(installment, { status: 201 });
  } catch (error) {
    console.error("Error creating installment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
