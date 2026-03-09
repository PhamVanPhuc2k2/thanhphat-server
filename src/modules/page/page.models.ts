import mongoose from "mongoose";

const seoSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }],
    ogImage: { type: String },
  },
  { _id: false },
);

const image = new mongoose.Schema(
  {
    url: String,
    public_id: String,
  },
  {
    _id: false,
  },
);

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    images: [image],

    seo: {
      type: seoSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Page", pageSchema);
