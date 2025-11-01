import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { inngest, resend } from "./client";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export const paymentReminders = inngest.createFunction(
  { id: "send-payment-reminders", name: "Send Payment Reminders" },
  { cron: "*/1 * * * *" },
  async ({ step }) => {
    const users = await step.run("fetch-debts", async () => {
      const result = await convex.query(api.inngest.getUsersWithOutstandingDebts);
      console.log("Fetched users with debts:", result);
      return result;
    });

    console.log(`Found ${users.length} users with outstanding debts`);

    if (!users || users.length === 0) {
      return {
        message: "No users with outstanding debts found",
        processed: 0,
        successes: 0,
        failures: 0,
      };
    }

    const results = [];

    for (const user of users) {
      if (!user.debts?.length) {
        console.log(`User ${user.name} has no debts, skipping`);
        continue;
      }

      console.log(`Processing user ${user.name} with ${user.debts.length} debts`);

      const rows = user.debts
        .map(
          (d) => `
            <tr>
              <td style="padding:4px 8px;">${d.name}</td>
              <td style="padding:4px 8px;">$${d.amount.toFixed(2)}</td>
            </tr>
          `
        )
        .join("");

      const html = `
        <h2>Splitz – Payment Reminder</h2>
        <p>Hi ${user.name}, you have the following outstanding balances:</p>
        <table cellspacing="0" cellpadding="0" border="1" style="border-collapse:collapse;">
          <thead>
            <tr><th>To</th><th>Amount</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p>Please settle up soon. Thanks!</p>
      `;

      try {
        const result = await step.run(`send-email-${user._id}`, async () => {
          console.log(`Attempting to send email to ${user.email}`);
          const emailResult = await resend.emails.send({
            from: "Splitz <onboarding@resend.dev>",
            to: user.email,
            subject: "You have pending payments on Splitz",
            html,
          });
          console.log(`Email API response:`, emailResult);
          return emailResult;
        });

        console.log(`✓ Email sent to ${user.email}:`, result);
        results.push({ userId: user._id, email: user.email, success: true, emailId: result.id });
      } catch (err) {
        console.error(`✗ Failed to send email to ${user.email}:`, err);
        results.push({
          userId: user._id,
          email: user.email,
          success: false,
          error: err.message,
        });
      }
    }

    const summary = {
      processed: results.length,
      successes: results.filter((r) => r.success).length,
      failures: results.filter((r) => !r.success).length,
      results,
    };

    console.log("Payment reminders summary:", summary);
    return summary;
  }
);
