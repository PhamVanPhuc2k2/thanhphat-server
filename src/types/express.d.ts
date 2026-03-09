import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    admin?: {
      _id: string;
      role: "super-admin" | "admin";
      name: string;
    };
  }
}

export {};
