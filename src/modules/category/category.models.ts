import mongoose, { mongo } from "mongoose";
import { ICategory } from "./category.types";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    hasChildren: {
      type: Boolean,
      required: true,
      default: false,
    },
    level: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    fullPath: {
      type: [String],
      required: true,
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    sortOrder: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ parentId: 1 });
categorySchema.index({ isActive: 1, sortOrder: -1 });;


export default mongoose.model<ICategory>("Category", categorySchema);
