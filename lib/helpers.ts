/**
 * Smart Cloudinary Upload Helper
 * - Small files/images → Upload via API route (/api/upload/cloudinary)
 * - Large files/videos → Direct upload to Cloudinary with signature
 */

export async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: "image" | "video" | "auto" = "auto",
  onProgress?: (progress: number) => void
) {
  try {
    // 👇 Decide upload method based on size & type
    const isLargeVideo =
      resourceType === "video" && file.size > 50 * 1024 * 1024; // >50MB

    if (isLargeVideo) {
      console.log("⚡ Using direct Cloudinary upload for large video...");

      // 🔹 Get signature from your API
      const signResponse = await fetch("/api/upload/cloudinary/sign");
      if (!signResponse.ok)
        throw new Error("Failed to get Cloudinary signature");
      const { signature, timestamp, cloudName, apiKey, uploadPreset } =
        await signResponse.json();

      // 🔹 Build form data for direct Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folder);

      // 🔹 Direct upload to Cloudinary API endpoint
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      return await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(json);
            } else {
              reject(
                new Error(json?.error?.message || `Upload failed (${xhr.status})`)
              );
            }
          } catch {
            reject(new Error("Invalid Cloudinary response"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    }

    // 🧠 Fallback: small files & images → upload through Next.js API
    console.log("🪶 Using internal API upload route...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("resource_type", resourceType);

    const response = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errText}`);
    }

    const result = await response.json();
    if (!result?.secure_url) {
      throw new Error(result?.error || "Cloudinary upload failed");
    }

    if (onProgress) onProgress(100);
    return result;
  } catch (err: any) {
    console.error("❌ uploadToCloudinary error:", err);
    throw new Error(err.message || "Unexpected upload error");
  }
}
