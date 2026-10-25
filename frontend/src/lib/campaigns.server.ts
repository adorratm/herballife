import "server-only";

import { getActiveCampaigns as getActiveCampaignsBase } from "@/lib/api";
import { getServerLocaleCurrency } from "@/lib/locale-currency.server";

export async function getActiveCampaigns() {
  const { locale } = await getServerLocaleCurrency();
  return getActiveCampaignsBase({ locale });
}
