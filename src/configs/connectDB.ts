import mongoose from "mongoose";
import { env } from "./env";

const connectDB = async () => {
  try {
    if (!env.MONGO_URL) {
      throw new Error("MONGO_URL chưa được khai báo");
    }
    await mongoose.connect(env.MONGO_URL);
    console.log("Kết nối với DB thành công");
  } catch (error) {
    console.error("Kết nối DB thất bại", error);
    process.exit(1);
  }
};

export default connectDB;
