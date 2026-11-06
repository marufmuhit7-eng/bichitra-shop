import Link from "next/link";
import type { Metadata } from "next";
import { categories, categoryBySlug, sellerBySlug } from "@/lib/sample-data";
import { queryProducts, type SortKey } from "@/lib/products";
import { bnNumber } from "@/lib/format";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = { title: "সব পণ্য" };

type SP = Record<string, string | undefined>;
const sorts: { v: SortKey; l: string }[] = [
  { v: "newest", l: "নতুন আগে" },
  { v: "popular", l: "জনপ্রিয়" },
  { v: "rating", l: "রেটিং অনুযায়ী" },
  { v: "price-asc", l: "দাম কম থেকে বেশি" },
  { v: "price-desc", l: "দাম বেশি থেকে কম" },
];

const num = (s?: string) => (s && s.trim() !== "" && !isNaN(Number(s)) ? Number(s) : undefined);

export default function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sort = (sorts.find((s) => s.v === searchParams.sort)?.v ?? "newest") as SortKey;
  const { items, total, pages, page } = queryProducts({
    q: searchParams.q,
    category: searchParams.category,
    seller: searchParams.seller,
    sort,
    inStock: searchParams.inStock === "1",
    min: num(searchParams.min),
    max: num(searchParams.max),
    page: num(searchParams.page) ?? 1,
  });

  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v && k !== "page") sp.set(k, v);
    sp.set("page", String(p));
    return `/products?${sp.toString()}`;
  };

  const heading = searchParams.q
    ? `"${searchParams.q}" এর ফলাফল`
    : searchParams.category
    ? categoryBySlug(searchParams.category)?.name ?? "সব পণ্য"
    : searchParams.seller
    ? sellerBySlug(searchParams.seller)?.name ?? "সব পণ্য"
    : "সব পণ্য";

  return (
    <div className="page py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl">{heading}</h1>
      <p className="mt-1 text-plum/70">{bnNumber(total)}টি পণ্য পাওয়া গেছে</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <form method="get" action="/products" className="h-fit rounded-card border border-line bg-white p-4 sm:p-5">
          <h2 className="font-display text-lg">ফিল্টার</h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label htmlFor="q" className="mb-1 block text-sm font-semibold">খুঁজুন</label>
              <input id="q" name="q" defaultValue={searchParams.q} className="field" placeholder="পণ্যের নাম" />
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-semibold">ক্যাটেগরি</label>
              <select id="category" name="category" defaultValue={searchParams.category ?? ""} className="field">
                <option value="">সব ক্যাটেগরি</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="min" className="mb-1 block text-sm font-semibold">সর্বনিম্ন ৳</label>
                <input id="min" name="min" inputMode="numeric" defaultValue={searchParams.min} className="field" />
              </div>
              <div>
                <label htmlFor="max" className="mb-1 block text-sm font-semibold">সর্বোচ্চ ৳</label>
                <input id="max" name="max" inputMode="numeric" defaultValue={searchParams.max} className="field" />
              </div>
            </div>
            <label className="flex min-h-[44px] items-center gap-2 text-[15px]">
              <input type="checkbox" name="inStock" value="1" defaultChecked={searchParams.inStock === "1"} className="h-5 w-5 accent-[#890E4F]" />
              শুধু স্টকে আছে
            </label>
            <div>
              <label htmlFor="sort" className="mb-1 block text-sm font-semibold">সাজান</label>
              <select id="sort" name="sort" defaultValue={sort} className="field">
                {sorts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
            {searchParams.seller && <input type="hidden" name="seller" value={searchParams.seller} />}
            <button type="submit" className="btn btn-primary w-full">ফিল্টার করুন</button>
            <Link href="/products" className="text-center text-sm font-semibold text-plum underline underline-offset-4">সব ফিল্টার মুছুন</Link>
          </div>
        </form>

        <div>
          {items.length === 0 ? (
            <div className="rounded-card border border-dashed border-plum/40 bg-sun-pale p-10 text-center">
              <p className="font-display text-xl">কোনো পণ্য পাওয়া যায়নি</p>
              <p className="mt-2">অন্য শব্দ দিয়ে খুঁজুন অথবা ফিল্টার কমিয়ে দেখুন।</p>
              <Link href="/products" className="btn btn-primary mt-5">সব পণ্য দেখুন</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {items.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="পৃষ্ঠা">
              {page > 1 ? <Link className="btn btn-outline" href={pageHref(page - 1)}>আগের পৃষ্ঠা</Link> : <span className="btn btn-outline" aria-disabled="true">আগের পৃষ্ঠা</span>}
              <span className="text-sm font-semibold">{bnNumber(page)} / {bnNumber(pages)}</span>
              {page < pages ? <Link className="btn btn-outline" href={pageHref(page + 1)}>পরের পৃষ্ঠা</Link> : <span className="btn btn-outline" aria-disabled="true">পরের পৃষ্ঠা</span>}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
