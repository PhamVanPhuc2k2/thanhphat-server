import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    orientation: {
      type: String,
      enum: ["horizontal", "vertical"],
      default: "horizontal",
      required: true,
    },
    link: { type: String },
    position: { type: String, enum: ["home_top", "category"] },
    isActive: { type: Boolean, default: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true },
);

bannerSchema.index({ isActive: 1, position: 1 });
bannerSchema.index({ categoryId: 1 });

export default mongoose.model("Banner", bannerSchema);
