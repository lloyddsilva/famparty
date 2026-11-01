import { OccasionDetail } from "../../../components/MarketingPages";
import { OCCASIONS } from "../../../lib/siteContent";

export function generateStaticParams() { return OCCASIONS.map((o) => ({ slug: o.slug })); }
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const o = OCCASIONS.find((x) => x.slug === slug);
  const DESCRIPTIONS = {
    "family-night": "Games for family night with kids, parents and grandparents in the same room: a show order that works, seating and pairing tips, and games nobody has to perform in.",
    "game-night": "Games for game night with friends: an icebreaker that isn't forced, a competitive peak, and a wind-down. A show order and setup tips for birthdays and reunions.",
    teams: "Short games for teams and video calls: a five-minute opener that puts nobody on the spot, plus setup tips for meeting rooms and shared screens.",
  };
  return { alternates: { canonical: `/for/${slug}` }, title: o ? `${o.name} — FamParty` : "FamParty", description: DESCRIPTIONS[slug] || o?.sub };
}
export default async function Page({ params }) {
  const { slug } = await params;
  return <OccasionDetail slug={slug} />;
}
