import fs from "fs";
import path from "path";
import PartsClient, {
  PartCatalogItem,
  DetailGifItem,
} from "@/components/PartsClient";

export const dynamic = "force-dynamic";

export default async function PartsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; q?: string; part?: string }>;
}) {
  const sp = await searchParams;
  let catalog: PartCatalogItem[] = [];
  let gifs: DetailGifItem[] = [];
  let metalIndex: Record<string, Array<{ f: string; t: string }>> = {};

  try {
    catalog = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "public/parts-catalog.json"),
        "utf-8"
      )
    );
  } catch {
    catalog = [];
  }

  try {
    gifs = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "public/detail-images-index.json"),
        "utf-8"
      )
    );
  } catch {
    gifs = [];
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
    <PartsClient
      catalog={catalog}
      gifs={gifs}
      metalIndex={metalIndex}
      initialGroup={sp.group || "all"}
      initialQuery={sp.q || sp.part || ""}
    />
  );
}
