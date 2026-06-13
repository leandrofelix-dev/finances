import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cards = await prisma.card.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      include: {
        invoices: true,
      },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, limit, closingDay, dueDay, color } = body;

    if (!name || limit === undefined || !closingDay || !dueDay || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const card = await prisma.card.create({
      data: {
        userId: user.id,
        name,
        limit: parseFloat(limit),
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay),
        color,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
