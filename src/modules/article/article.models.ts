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
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false },
);

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    content: { type: String, required: true },

    excerpt: { type: String, required: true },

    thumbnail: {
      type: image,
      required: true,
    },

    images: [image],

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    publishedAt: {
      type: Date,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    seo: {
      type: seoSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Article", articleSchema);
