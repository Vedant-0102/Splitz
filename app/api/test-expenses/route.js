import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";

export async function GET() {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  try {
    const expenses = await convex.query(api.inngest.getAllExpenses);
    const users = await convex.query(api.inngest.getAllUsers);

    return NextResponse.json({
      success: true,
      totalExpenses: expenses.length,
      totalUsers: users.length,
      expenses: expenses.map(e => ({
        description: e.description,
        amount: e.amount,
        paidBy: e.paidByUserId,
        splits: e.splits,
        groupId: e.groupId
      })),
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
