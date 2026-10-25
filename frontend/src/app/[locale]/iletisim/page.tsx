import { getLocale, getTranslations } from "next-intl/server";
import { ContactPageClient } from "@/components/ContactPageClient";
import {
  getContentSections,
  getSiteSettings,
  sectionContent,
} from "@/lib/cms";

type ContactHeader = {
  title: string;
  subtitle: string;
};

export default async function ContactPage() {
  const locale = await getLocale();
  const [settings, sections, t] = await Promise.all([
    getSiteSettings(locale),
    getContentSections("contact", locale),
    getTranslations("contactPage"),
  ]);

  const header = sectionContent<ContactHeader>(sections, "header", {
    title: t("metaTitle"),
    subtitle: t("metaDescription", { brand: settings.brand.name }),
  });

  return (
    <ContactPageClient
      contact={settings.contact}
      whatsapp={settings.whatsapp}
      brandName={settings.brand.name}
      title={header.title}
      subtitle={header.subtitle}
    />
  );
}
