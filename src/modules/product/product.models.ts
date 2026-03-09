import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionImages: {
      type: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
      ],
      default: [],
    },

    images: {
      type: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
      ],
      default: [],
    },
    video: {
      url: String,
      public_id: String,
    },
    specs: [{ key: String, value: String }],
    isActive: {
      type: Boolean,
      required: true,
    },
    seo: {
      title: {
        type: String,
        required: true,
      },
      description: { type: String, required: true },
      keywords: { type: [String], required: true },
      ogImage: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ categoryId: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model("Product", productSchema);
