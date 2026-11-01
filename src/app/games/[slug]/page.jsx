import { GameDetail } from "../../../components/MarketingPages";
import { GAMES } from "../../../lib/siteContent";

export function generateStaticParams() { return GAMES.map((g) => ({ slug: g.slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = GAMES.find((x) => x.slug === slug);
  return { alternates: { canonical: `/games/${slug}` }, title: g ? `${g.name} — FamParty` : "FamParty", description: g?.blurb };
}
export default async function Page({ params }) {
  const { slug } = await params;
  return <GameDetail slug={slug} />;
}
