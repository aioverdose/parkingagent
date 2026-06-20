import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "Parking Agent <noreply@parkingagent.com>";

export async function sendEmail(
  email: string,
  subject: string,
  text: string,
) {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      text,
    });
  } catch {
    console.error("Failed to send email");
  }
}

export async function sendMatchNotification(
  email: string,
  name: string,
  type: "arriving" | "departing",
  spotAddress?: string,
) {
  if (!resend) return;

  const subject = type === "arriving"
    ? "🎯 Spot Found! Head to your matched parking spot"
    : "🚗 Someone is coming for your spot";

  const text = type === "arriving"
    ? `Hi ${name},\n\nA parking spot has been matched for you${spotAddress ? ` at ${spotAddress}` : ""}. Head to the location now — the departing member is waiting.\n\nOpen your Parking Agent dashboard for the route map and arrival timer.\n\n— Parking Agent`
    : `Hi ${name},\n\nA good-standing member is on their way to take your parking spot${spotAddress ? ` at ${spotAddress}` : ""}. You can leave once they arrive.\n\nOpen your Parking Agent dashboard to track their arrival.\n\n— Parking Agent`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      text,
    });
  } catch {
    console.error("Failed to send email");
  }
}
