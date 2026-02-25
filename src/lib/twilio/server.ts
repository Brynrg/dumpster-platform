import "server-only";
import Twilio from "twilio";

export function isSmsEnabled(): boolean {
  return process.env.SMS_ENABLED === "true";
}

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1${digits.slice(1)}`;
  }

  if (trimmed.startsWith("+1") && digits.length >= 11) {
    return `+1${digits.slice(1, 11)}`;
  }

  return "";
}

export async function sendSms(
  to: string,
  body: string,
): Promise<{ sid: string }> {
  if (!isSmsEnabled()) {
    throw new Error("SMS is disabled. Set SMS_ENABLED=true to send messages.");
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      "Missing Twilio env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are required when SMS is enabled.",
    );
  }

  const normalizedTo = normalizePhone(to);
  if (!normalizedTo) {
    throw new Error("Invalid destination phone number.");
  }

  const client = Twilio(accountSid, authToken);
  const message = await client.messages.create({
    to: normalizedTo,
    from: fromNumber,
    body,
  });

  return { sid: message.sid };
}
