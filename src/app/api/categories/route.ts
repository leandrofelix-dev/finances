import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/get-session";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, icon, allocationPercentage, maxLimit } = body;

    if (!name || !color || !icon) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name,
        color,
        icon,
        allocationPercentage: allocationPercentage !== undefined && allocationPercentage !== "" ? parseFloat(allocationPercentage) : null,
        maxLimit: maxLimit !== undefined && maxLimit !== "" ? parseFloat(maxLimit) : null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
