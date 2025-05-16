// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectMongo from "./libs/connectMongo";
import userRoutes from "./routes/userRoutes";
import PORoutes from "./routes/PORoutes";
import vendorRoutes from "./routes/vendorRoutes";

dotenv.config();

async function main() {
  // ← now you can await safely
  await connectMongo();

  const app = express();

  app.use(
    cors({
      origin: process.env.NEXT_PUBLIC_DOMAIN,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json());

  app.use("/api/users", userRoutes);
  app.use("/api/po", PORoutes);
  app.use("/api/vendors", vendorRoutes);

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
