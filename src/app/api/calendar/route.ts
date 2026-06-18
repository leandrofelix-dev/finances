import { NextRequest, NextResponse } from "next/server";
import { getCalendarMonth } from "@/lib/finance";
import { getSessionUser } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const yearParam = request.nextUrl.searchParams.get("year");
    const monthParam = request.nextUrl.searchParams.get("month");
    const now = new Date();
    const year = yearParam ? Number.parseInt(yearParam, 10) : now.getFullYear();
    const month = monthParam ? Number.parseInt(monthParam, 10) : now.getMonth() + 1;

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
    }

    const data = await getCalendarMonth(user.id, year, month);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
