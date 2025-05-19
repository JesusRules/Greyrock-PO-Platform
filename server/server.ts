// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectMongo from "./libs/connectMongo";
import authRoutes from "./routes/authRoutes";
import PORoutes from "./routes/PORoutes";
import vendorRoutes from "./routes/vendorRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

async function main() {
  // ← now you can await safely
  await connectMongo();

  const app = express();

  app.use(
    cors({
      origin: process.env.DOMAIN,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/purchase-orders", PORoutes);
  app.use("/api/vendors", vendorRoutes);
  app.use("/api/departments", departmentRoutes);
  app.use("/api/users", userRoutes);

  app.get("/test", (_, res) => {
    res.send("✅ Test route is working!");
  });

  const PORT = process.env.PORT || 3299;
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

// call it (and crash on unhandled errors)
main().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
