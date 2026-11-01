
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";

dotenv.config();

const app = express();

// Allowed frontend origins
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
]);

// Add deployed frontend URL through environment variable
const configuredOrigin = process.env.CLIENT_ORIGIN?.trim().replace(/\/+$/, "");

if (configuredOrigin) {
  allowedOrigins.add(configuredOrigin);
}

// Middleware
app.use(express.json());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");

      const isLocalhostVite =
        /^http:\/\/localhost:517\d$/.test(normalizedOrigin) ||
        /^http:\/\/127\.0\.0\.1:517\d$/.test(normalizedOrigin);

      if (allowedOrigins.has(normalizedOrigin) || isLocalhostVite) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true
  })
);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Queue Token System backend is running"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/queue", queueRoutes);

// Render provides the PORT environment variable
const PORT = process.env.PORT || 8080;

// MongoDB Atlas connection string
const MONGO_URI = process.env.MONGO_URI;

async function main() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    // Connect to MongoDB Atlas
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");

    // Start server on Render
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Backend startup failed:", err.message);
    process.exit(1);
  }
}

main();
