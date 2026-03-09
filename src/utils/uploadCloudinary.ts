import cloudinary from "../configs/cloudinary";

export const uploadCloudinary = (
  buffer: Buffer,
  type: "image" | "video",
  folder:
    | "category"
    | "product"
    | "brand"
    | "variant"
    | "banner"
    | "article"
    | "page",
) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise<{
    url: string;
    public_id: string;
    duration?: string;
    format?: string;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: type,
          folder: folder,
          public_id: id,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload thất bại"));
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration,
            format: result.format,
          });
        },
      )
      .end(buffer);
  });
};
