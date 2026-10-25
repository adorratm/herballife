import { redirect } from "next/navigation";

/** Eski / alternatif URL — koçluk sayfasına yönlendir */
export default function DanismanlikRedirectPage() {
  redirect("/kocluk");
}
