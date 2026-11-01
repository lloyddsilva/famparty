import { BlogIndex } from "../../components/MarketingPages";
export const metadata = { title: "Blog — FamParty", description: "Ideas, hosting tips and game guides for your next get-together.", alternates: { canonical: "/blog" } };
export default async function Page({ searchParams }) {
  const { cat } = await searchParams;
  return <BlogIndex active={typeof cat === "string" ? cat : "All"} />;
}
