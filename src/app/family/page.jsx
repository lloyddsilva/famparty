import { redirect } from "next/navigation";

// Family albums are hidden from launch behind the FAMPARTY_ALBUMS flag.
// Until it is on, this page simply sends people to How it works.
export default function Page() {
  redirect("/how-it-works");
}
