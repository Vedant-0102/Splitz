import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { spendingInsights } from "@/lib/inngest/spending-insights";
import { paymentReminders } from "@/lib/inngest/payment-reminders";

export const runtime = "nodejs";
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [spendingInsights, paymentReminders],
});
