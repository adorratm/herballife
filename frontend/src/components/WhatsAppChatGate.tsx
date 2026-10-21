"use client";

import { WhatsAppChat } from "@/components/WhatsAppChat";
import type { WhatsAppPreset } from "@/lib/whatsapp";

type Props = {
  enabled?: boolean;
  phone?: string | null;
  brandName?: string;
  greeting?: string;
  presets?: WhatsAppPreset[];
};

export function WhatsAppChatGate(props: Props) {
  return <WhatsAppChat {...props} />;
}
