import fs from "fs";
import path from "path";
import AssembliesClient, { AssemblySection } from "@/components/AssembliesClient";

export const dynamic = "force-dynamic";

export default async function AssembliesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  let sections: AssemblySection[] = [];
  let metalIndex: Record<string, Array<{ f: string; t: string }>> = {};

  try {
    sections = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "public/data/assemblies.json"),
        "utf-8"
      )
    );
  } catch {
    sections = [];
  }

  try {
    const rawMetal = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "public/data/metal-index.json"),
        "utf-8"
      )
    );
    metalIndex = rawMetal.byNum || rawMetal || {};
  } catch {
    metalIndex = {};
  }

  return (
    <AssembliesClient
      sections={sections}
      metalIndex={metalIndex}
      initialFilter={sp.filter || ""}
    />
  );
}
