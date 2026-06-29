const cloudinary = require("cloudinary").v2;

// 1. Configure Cloudinary — Inline configuration block
cloudinary.config({
  cloud_name: "dvf8quhuo",
  api_key: "659186439424781",
  api_secret: "TVEa1MEMTnYAfEv5xPnfcqm3MDg",
  secure: true,
});

async function runOnboarding() {
  try {
    console.log("Starting Cloudinary onboarding script...\n");

    // 2. Upload an image — Upload sample image URL from Cloudinary's demo domain
    const sampleImageUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const uploadResult = await cloudinary.uploader.upload(sampleImageUrl, {
      folder: "onboarding_demo",
    });

    console.log("=== Upload Summary ===");
    console.log("Secure URL:", uploadResult.secure_url);
    console.log("Public ID:", uploadResult.public_id);

    // 3. Get image details — Print metadata (width, height, format, file size in bytes)
    console.log("\n=== Image Metadata ===");
    console.log("Width:", uploadResult.width);
    console.log("Height:", uploadResult.height);
    console.log("Format:", uploadResult.format);
    console.log("File Size (bytes):", uploadResult.bytes);

    // 4. Transform the image
    // f_auto: Automatically selects the optimal file format (such as WebP or AVIF) for the viewing browser.
    // q_auto: Automatically applies optimal quality compression to minimize file size without perceptual quality loss.
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      transformation: [
        { fetch_format: "auto", quality: "auto" }
      ],
      secure: true
    });

    console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
    console.log("Transformed URL:", transformedUrl);

  } catch (error) {
    console.error("Error executing Cloudinary onboarding script:", error);
  }
}

runOnboarding();
