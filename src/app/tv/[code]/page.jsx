"use client";

import { useParams } from "next/navigation";
import TvDisplay from "../../../components/TvDisplay";

export default function Page() {
  const { code } = useParams();
  return <TvDisplay code={String(code || "").toUpperCase()} />;
}
