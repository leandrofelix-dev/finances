import { NextRequest, NextResponse } from "next/server";
import { buildProjection } from "@/lib/finance";
import { getSessionUser } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  try {
    const target = request.nextUrl.searchParams.get("targetDate");
    const targetDate = target ? new Date(target) : new Date(new Date().setMonth(new Date().getMonth() + 3));

    if (Number.isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid targetDate" }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const projection = await buildProjection(user.id, targetDate);
    return NextResponse.json(projection);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = message.includes("future") ? 400 : 500;

    console.error("Error calculating projections:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
