import cron from "node-cron";
import cloudinary from "../configs/cloudinary";
import Category from "../modules/category/category.models";
import Product from "../modules/product/product.models";
import Brand from "../modules/brand/brand.models";

const FOLDERS = ["category", "brand", "product"] as const;

const getAllUsedPublicIds = async () => {
  const [categories, products, brands] = await Promise.all([
    Category.find({}, "image.public_id"),
    Product.find(
      {},
      "images.public_id video.public_id seo.ogImage.public_id descriptionImages.public_id",
    ),
    Brand.find({}, "logo.public_id"),
  ]);
  const ids = new Set<string>();
  categories.forEach((item) => {
    if (item.image?.public_id) ids.add(item.image.public_id);
  });
  products.forEach((item) => {
    item.images.forEach((img) => {
      if (img.public_id) {
        ids.add(img.public_id);
      }
    });
    if (item.video?.public_id) ids.add(item.video.public_id);
    if (item.seo?.ogImage?.public_id) ids.add(item.seo.ogImage.public_id);
  });
  brands.forEach((item) => {
    if (item.logo?.public_id) ids.add(item.logo?.public_id);
  });
  return ids;
};

const getAllCloudinaryImages = async (folder: string): Promise<any[]> => {
  const resources: any[] = [];
  let nextCursor: string | undefined;
  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 500,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });
    resources.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);
  return resources;
};

const cleanupCloudinary = async () => {
  try {
    console.log("Bắt đầu dọn dẹp cloudinary...");
    const usedIds = await getAllUsedPublicIds();
    for (const folder of FOLDERS) {
      const resources = await getAllCloudinaryImages(folder);
      for (const resource of resources) {
        const publicId = resource.public_id;
        const createdAt = new Date(resource.created_at);
        const diffMinutes = (Date.now() - createdAt.getTime()) / 1000 / 60;
        if (diffMinutes < 10) continue;
        if (!usedIds.has(publicId)) {
          console.log("Xóa:", publicId);
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }
    console.log("Đã xóa xong!");
  } catch (error) {
    console.error("Lỗi dọn ảnh:", error);
  }
};

export const startCleanupCloudinaryCron = () => {
  cron.schedule("0 * * * *", async () => {
    await cleanupCloudinary();
  });
};
