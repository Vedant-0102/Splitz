import { Inngest } from "inngest";
import { Resend } from "resend";

export const inngest = new Inngest({
  id: "splitz",
  name: "Splitz",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export const resend = new Resend(process.env.RESEND_API_KEY);