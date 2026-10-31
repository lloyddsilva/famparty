"use client";

import { useParams } from "next/navigation";
import FamilyPage from "../../../components/FamilyPage";

export const dynamic = "force-dynamic";

export default function Page() {
  const { token } = useParams();
  return <FamilyPage token={String(token || "")} />;
}
