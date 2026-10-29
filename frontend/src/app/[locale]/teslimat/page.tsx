import { LegalPage } from "@/components/LegalPage";
import { legalMetadata } from "@/lib/legal-seo";

export const generateMetadata = () => legalMetadata("teslimat");

export default function Page() {
  return <LegalPage slug="teslimat" />;
}
