import { OccasionDetail } from "../../../components/MarketingPages";
import { OCCASIONS } from "../../../lib/siteContent";

export function generateStaticParams() { return OCCASIONS.map((o) => ({ slug: o.slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const o = OCCASIONS.find((x) => x.slug === slug);
  return { alternates: { canonical: `/for/${slug}` }, title: o ? `${o.name} — FamParty` : "FamParty", description: o?.sub };
}
export default async function Page({ params }) {
  const { slug } = await params;
  return <OccasionDetail slug={slug} />;
}
