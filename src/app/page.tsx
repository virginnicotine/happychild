import fs from "fs";
import path from "path";
import { ensureFactoryDb } from "@/lib/db-seed";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureFactoryDb();

  let partsSample = [];
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "public/parts-catalog.json"),
      "utf-8"
    );
    partsSample = JSON.parse(raw);
  } catch {
    partsSample = [];
  }

  return <HomeClient partsSample={partsSample} />;
}
