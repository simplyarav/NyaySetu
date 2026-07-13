import { NextResponse } from "next/server";
import { getIndianHolidays } from "@/lib/holidays";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const yearStr = searchParams.get("year");
    
    if (!yearStr) {
      return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    if (isNaN(year)) {
      return NextResponse.json({ error: "Invalid year format" }, { status: 400 });
    }

    const holidays = await getIndianHolidays(year);
    
    return NextResponse.json(holidays);
  } catch (error) {
    console.error("GET holidays Error:", error);
    // Graceful degradation in API as well
    return NextResponse.json([]);
  }
}
