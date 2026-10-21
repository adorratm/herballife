import Link from "next/link";

type Item = { href: string; label: string };

export function FooterNavLinks({
  items,
  className,
}: {
  items: Item[];
  className?: string;
}) {
  return (
    <>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={className}>
          {item.label}
        </Link>
      ))}
    </>
  );
}
