import { NextResponse } from "next/server";

export const dynamic = "force-static";

// Chrome DevTools workspace configuration endpoint
// Responds with 200 OK to GET /.well-known/appspecific/com.chrome.devtools.json
export async function GET() {
  return NextResponse.json(
    {
      workspace: {
        root: "/",
      },
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    }
  );
}
