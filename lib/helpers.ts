export async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: "image" |"audio" | "video" | "auto" = "auto"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("resource_type", resourceType);

  const res = await fetch("/api/upload/cloudinary", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Cloudinary upload failed");
  return res.json();
}
