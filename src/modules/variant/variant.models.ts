import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    percentDiscount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

variantSchema.index({ productId: 1, name: 1 }, { unique: true });
variantSchema.index({ productId: 1, isActive: 1 });

export default mongoose.model("Variant", variantSchema);
