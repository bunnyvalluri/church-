import { NextResponse } from "next/server";
import { requireEventManagerOrDev } from "@/lib/authMiddleware";
import { uploadBufferToCloudinary, deleteCloudinaryAsset } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

// Cloudinary folder for service icons/images
const SERVICES_FOLDER = "church-platform/services";

// ── POST /api/upload/service-icon ────────────────────────────────────────────────
// Uploads a service card image/icon to Cloudinary
// Returns: { url, publicId }
export async function POST(req: Request) {
  const auth = await requireEventManagerOrDev(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const oldPublicId = formData.get("oldPublicId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, SVG, GIF" },
        { status: 400 }
      );
    }

    // Validate file size — max 5MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old Cloudinary asset if replacing
    if (oldPublicId) {
      try {
        await deleteCloudinaryAsset(oldPublicId, "image");
      } catch { /* non-critical — proceed */ }
    }

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(buffer, "events", "image");

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err: any) {
    console.error("[API/UPLOAD/SERVICE-ICON]", err);
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 500 });
  }
}
