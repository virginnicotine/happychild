import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import SlideSpecClient, { SlideSpec } from "@/components/SlideSpecClient";

export const dynamic = "force-dynamic";

export default async function SlideSpecPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = decodeURIComponent(code).replace(/^ГСР-/i, "");
  const specPath = path.join(process.cwd(), "public/data/slides", `spec-${cleanCode}.json`);
  if (!fs.existsSync(specPath)) notFound();
  const spec: SlideSpec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
  return <SlideSpecClient spec={spec} />;
}
