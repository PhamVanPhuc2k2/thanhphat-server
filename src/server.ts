import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectDB from "./configs/connectDB";
import { connectRedis, redis } from "./configs/redis";
import { env } from "./configs/env";
import mongoose from "mongoose";

const PORT = env.PORT;

const startServer = async () => {
  await connectDB();
  await connectRedis();

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down gracefully ...`)
    server.close(async () => {
      await mongoose.connection.close();
      await redis.quit();
      console.log('All conncection closed.');
      process.exit(0);
    })
    setTimeout(() => process.exit(1), 10000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

};

startServer();
