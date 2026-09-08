import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "llms.txt");
  let content = "";

  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    content = `# Kingdom of Christ Ministries (KCM Church)\n\nOfficial website: https://kcmchurch.vercel.app\nFounder: Bishop Kurra Kristhu Raju`;
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
