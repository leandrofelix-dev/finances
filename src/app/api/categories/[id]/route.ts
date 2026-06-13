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
    const { name, color, icon, allocationPercentage, maxLimit } = body;

    if (!name || !color || !icon) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const category = await prisma.category.update({
      where: { id, userId: user.id },
      data: {
        name,
        color,
        icon,
        allocationPercentage: allocationPercentage !== undefined && allocationPercentage !== "" ? parseFloat(allocationPercentage) : null,
        maxLimit: maxLimit !== undefined && maxLimit !== "" ? parseFloat(maxLimit) : null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
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

    await prisma.category.delete({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
