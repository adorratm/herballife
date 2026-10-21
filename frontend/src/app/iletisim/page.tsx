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
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    getContentSections("contact"),
  ]);

  const header = sectionContent<ContactHeader>(sections, "header", {
    title: "İletişim",
    subtitle:
      "Ürün danışmanlığı, sipariş ve beslenme takibi için bize yazın. Bağımsız distribütör Emine Özberk.",
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
