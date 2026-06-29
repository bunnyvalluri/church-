/**
 * frontend/lib/cloudinary.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Cloudinary Media Storage Integration
 * Production-ready SDK configuration, folder management, image/video optimization,
 * secure upload streams, and deletion routines for Church Management Platform.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

// Configure Cloudinary SDK instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "1234567890",
  api_secret: process.env.CLOUDINARY_API_SECRET || "sample_api_secret",
  secure: true,
});

export { cloudinary };

// Root folder structure definition
export const CLOUDINARY_FOLDERS = {
  EVENTS: "church-platform/events",
  SERMONS: "church-platform/sermons",
  NGO: "church-platform/ngo",
  PROFILES: "church-platform/profiles",
  ANNOUNCEMENTS: "church-platform/announcements",
  VOLUNTEER: "church-platform/volunteer",
  BRANCHES: {
    SHAPUR_NAGAR: "church-platform/branches/shapur-nagar",
    SUBHASH_NAGAR: "church-platform/branches/subhash-nagar",
    BAHADURPALLY: "church-platform/branches/bahadurpally",
  },
} as const;

export type TargetFolderType =
  | "events"
  | "sermons"
  | "ngo"
  | "profiles"
  | "announcements"
  | "volunteer"
  | "branch-shapur-nagar"
  | "branch-subhash-nagar"
  | "branch-bahadurpally";

/**
 * Maps input category/type to exact Cloudinary folder path
 */
export function getCloudinaryFolder(folderType: TargetFolderType): string {
  switch (folderType) {
    case "events":
      return CLOUDINARY_FOLDERS.EVENTS;
    case "sermons":
      return CLOUDINARY_FOLDERS.SERMONS;
    case "ngo":
      return CLOUDINARY_FOLDERS.NGO;
    case "profiles":
      return CLOUDINARY_FOLDERS.PROFILES;
    case "announcements":
      return CLOUDINARY_FOLDERS.ANNOUNCEMENTS;
    case "volunteer":
      return CLOUDINARY_FOLDERS.VOLUNTEER;
    case "branch-shapur-nagar":
      return CLOUDINARY_FOLDERS.BRANCHES.SHAPUR_NAGAR;
    case "branch-subhash-nagar":
      return CLOUDINARY_FOLDERS.BRANCHES.SUBHASH_NAGAR;
    case "branch-bahadurpally":
      return CLOUDINARY_FOLDERS.BRANCHES.BAHADURPALLY;
    default:
      return CLOUDINARY_FOLDERS.EVENTS;
  }
}

/**
 * Uploads a Buffer (file in memory) to Cloudinary asynchronously.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folderType: TargetFolderType,
  resourceType: "image" | "video" | "auto" = "auto",
  customPublicId?: string
): Promise<UploadApiResponse> {
  const folder = getCloudinaryFolder(folderType);

  const options: UploadApiOptions = {
    folder,
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  };

  if (customPublicId) {
    options.public_id = customPublicId;
  }

  // Phase 5 & 6: Automated Image and Video Optimization transformations on upload
  if (resourceType === "image" || resourceType === "auto") {
    options.transformation = [
      { quality: "auto", fetch_format: "auto" },
      { width: 2000, crop: "limit" }, // max responsive width bound
    ];
  } else if (resourceType === "video") {
    options.transformation = [
      { quality: "auto", fetch_format: "auto" },
    ];
  }

  return new Promise((resolve, reject) => {
    // If Cloudinary keys are default mock values and not real credentials, generate mock response for seamless dev
    if (
      process.env.NODE_ENV !== "production" &&
      (process.env.CLOUDINARY_CLOUD_NAME === "demo" || !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === "1234567890")
    ) {
      const randomId = Math.random().toString(36).substring(2, 9);
      const mockPublicId = `${folder}/dev_mock_${randomId}`;
      const isVid = resourceType === "video";
      const mockUrl = isVid
        ? `https://res.cloudinary.com/demo/video/upload/v1234567890/${mockPublicId}.mp4`
        : `https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1000&q=80`;

      return resolve({
        public_id: mockPublicId,
        version: 1234567890,
        signature: "mock_signature",
        width: 1200,
        height: 800,
        format: isVid ? "mp4" : "jpg",
        resource_type: isVid ? "video" : "image",
        created_at: new Date().toISOString(),
        tags: [],
        bytes: buffer.length,
        type: "upload",
        etag: "mock_etag",
        placeholder: false,
        url: mockUrl,
        secure_url: mockUrl,
        access_mode: "public",
        original_filename: "uploaded_media",
      } as any);
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        return reject(error || new Error("Cloudinary upload returned empty result."));
      }
      resolve(result);
    });

    uploadStream.end(buffer);
  });
}

/**
 * Deletes a media asset from Cloudinary using its publicId.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ result: string }> {
  if (
    process.env.NODE_ENV !== "production" &&
    (process.env.CLOUDINARY_CLOUD_NAME === "demo" || !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === "1234567890")
  ) {
    return { result: "ok" };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

/**
 * Generates an optimized, transformation-applied Cloudinary URL for landing pages & responsive UI.
 */
export function getOptimizedCloudinaryUrl(
  urlOrPublicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    blur?: boolean;
  } = {}
): string {
  if (!urlOrPublicId) return "";

  // If it's already a external non-cloudinary URL (e.g. unsplash placeholder), return as is
  if (urlOrPublicId.startsWith("http") && !urlOrPublicId.includes("cloudinary.com")) {
    return urlOrPublicId;
  }

  const { width = 800, height, crop = "fill", quality = "auto", format = "auto", blur = false } = options;

  const transformations: string[] = [`q_${quality}`, `f_${format}`];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (blur) transformations.push("e_blur:300");

  const transformString = transformations.join(",");

  if (urlOrPublicId.includes("/upload/")) {
    return urlOrPublicId.replace("/upload/", `/upload/${transformString}/`);
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${urlOrPublicId}`;
}
