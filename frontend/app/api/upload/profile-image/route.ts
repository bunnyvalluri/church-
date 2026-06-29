import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authMiddleware";
import { validateFileSecurity } from "@/lib/uploadSecurity";
import { uploadBufferToCloudinary, deleteCloudinaryAsset } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No profile image file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Security check (images only for profile)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed for profile avatars." }, { status: 422 });
    }

    const validation = validateFileSecurity(buffer, file.name, file.type);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    // Check existing user to delete old profile asset if replacing
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.uid },
      select: { profilePublicId: true },
    });

    if (currentUser?.profilePublicId) {
      try {
        await deleteCloudinaryAsset(currentUser.profilePublicId, "image");
      } catch {
        // Continue if old asset deletion fails
      }
    }

    // Upload to church-platform/profiles/
    const uploadResult = await uploadBufferToCloudinary(buffer, "profiles", "image");

    // Update user record in database
    const updatedUser = await prisma.user.update({
      where: { id: auth.uid },
      data: {
        image: uploadResult.secure_url,
        profilePublicId: uploadResult.public_id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (err: any) {
    console.error("[API/UPLOAD/PROFILE-IMAGE] Error:", err);
    return NextResponse.json({ error: err.message || "Profile image upload failed." }, { status: 500 });
  }
}
