import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import ProductSpecClient, { SpecData } from "@/components/ProductSpecClient";

export const dynamic = "force-dynamic";

export default async function ProductSpecPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cleanCode = decodeURIComponent(code)
    .replace(/^ИКССР-/i, "")
    .replace(/\.Н$/i, "");

  const specPath = path.join(
    process.cwd(),
    "public/data",
    `spec-${cleanCode}.json`
  );

  if (!fs.existsSync(specPath)) {
    notFound();
  }

  const spec: SpecData = JSON.parse(fs.readFileSync(specPath, "utf-8"));

  let metalIndex: Record<string, Array<{ f: string; t: string }>> = {};
  try {
    const rawMetal = fs.readFileSync(
      path.join(process.cwd(), "public/data/metal-index.json"),
      "utf-8"
    );
    const parsed = JSON.parse(rawMetal);
    metalIndex = parsed.byNum || parsed || {};
  } catch {
    metalIndex = {};
  }

  return <ProductSpecClient spec={spec} metalIndex={metalIndex} />;
}
