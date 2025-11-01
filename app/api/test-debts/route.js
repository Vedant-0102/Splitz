import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";

export async function GET() {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  try {
    const users = await convex.query(api.inngest.getUsersWithOutstandingDebts);
    
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: users.map(u => ({
        name: u.name,
        email: u.email,
        debtCount: u.debts?.length || 0,
        debts: u.debts
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
