import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";

/** Eski / alternatif URL — koçluk sayfasına yönlendir */
export default async function DanismanlikRedirectPage() {
  const locale = await getLocale();
  redirect({ href: "/kocluk", locale });
}
