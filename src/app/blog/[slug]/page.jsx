import { BlogPost } from "../../../components/MarketingPages";
import { POSTS } from "../../../lib/siteContent";

export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug);
  return { title: p ? `${p.title} — FamParty Blog` : "FamParty Blog", description: p?.dek };
}
export default async function Page({ params }) {
  const { slug } = await params;
  return <BlogPost slug={slug} />;
}
