import { isEvolutionConfigured } from "@/lib/auth/evolution-api";

export type WhatsAppProvider = "green" | "evolution";

export function getWhatsAppProvider(): WhatsAppProvider {
  const raw = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
  if (!raw || raw === "green") return "green";
  if (raw === "evolution") return "evolution";
  throw new Error("WHATSAPP_PROVIDER_INVALID");
}

export function isWhatsAppSendConfigured() {
  const raw = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
  if (raw === "evolution") {
    return isEvolutionConfigured();
  }
  if (raw && raw !== "green") {
    return false;
  }
  return Boolean(
    process.env.GREEN_API_INSTANCE_ID && process.env.GREEN_API_TOKEN
  );
}
