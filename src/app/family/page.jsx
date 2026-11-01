import { redirect } from "next/navigation";

// Family albums are hidden from launch (flag off). The create form and all
// album code stay in the repo behind FAMPARTY_ALBUMS; this page redirects.
export default function Page() {
  if (process.env.FAMPARTY_ALBUMS !== "1") redirect("/how-it-works");
  redirect("/how-it-works");
}
