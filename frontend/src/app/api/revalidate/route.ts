import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/i18n/routing";

function authorized(req: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET || process.env.JWT_SECRET;
  if (!secret) return false;
  const header = req.headers.get("x-revalidate-secret");
  const query = req.nextUrl.searchParams.get("secret");
  return header === secret || query === secret;
}

/**
 * Admin/API webhook: CMS ayarları kaydedilince önbelleği hemen yenile.
 * POST { "scope": "cms" } + header x-revalidate-secret
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    scope?: string;
    tags?: string[];
    paths?: string[];
  };

  const tags = new Set<string>(body.tags || []);
  if (!body.tags?.length && (body.scope === "cms" || !body.scope)) {
    for (const locale of locales) {
      tags.add(`cms-settings-${locale}`);
    }
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  const paths = body.paths?.length ? body.paths : ["/", "/sepet"];
  for (const path of paths) {
    revalidatePath(path, "layout");
  }

  return NextResponse.json({
    ok: true,
    revalidated: true,
    tags: [...tags],
    paths,
  });
}
