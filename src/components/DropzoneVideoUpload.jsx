import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

// Import middlewares
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { apiLimiter, authLimiter, notificationLimiter } from "./middlewares/rateLimiter.js";
import { duplicateRequestGuard, rateLimitGuard, requestSizeGuard, requestTimeoutGuard } from "./middlewares/requestGuard.js";

// Import Swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Import routes
import adminRoutes from "./routes/admin/index.js";
import studentMobileRoutes from "./routes/mobile/student/index.js";
import teacherMobileRoutes from "./routes/mobile/teacher/index.js";
import adminMobileRoutes from "./routes/mobile/admin/index.js";
import publicMobileRoutes from "./routes/mobile/public/index.js";
import webRoutes from "./routes/web/index.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import videoUploadRoutes from "./routes/admin/video-upload.js"; // New video upload route

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Debug: Log the port being used
console.log("🔍 Environment PORT:", process.env.PORT);
console.log("🔍 Final PORT:", PORT);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LMS API Documentation",
      version: "1.0.0",
      description: "Learning Management System API for University in Kuwait",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// CORS Configuration
const rawAllowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173||https://dr-low.vercel.app")
  .split("||")
  .map((url) => url.trim())
  .filter((url) => url);

rawAllowedOrigins.push("https://dr-low.vercel.app");

const allowedHostnames = new Set(
  rawAllowedOrigins
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      try {
        const normalized = entry.includes("://") ? entry : `https://${entry}`;
        return new URL(normalized).hostname.toLowerCase();
      } catch {
        return null;
      }
    })
    .filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isLocalNetwork = /^(http:\/\/)?(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin);

      try {
        const requestHostname = new URL(origin).hostname.toLowerCase();
        if (allowedHostnames.has(requestHostname) || isLocalNetwork) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      } catch {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["Retry-After"],
  })
);

// Request guards - SKIP for upload routes
app.use((req, res, next) => {
  // Skip guards for video upload endpoints
  if (req.path.includes('/upload/video-chunk')) {
    return next();
  }
  rateLimitGuard(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.includes('/upload/video-chunk')) {
    return next();
  }
  duplicateRequestGuard(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.includes('/upload/video-chunk')) {
    return next();
  }
  requestSizeGuard(10 * 1024 * 1024)(req, res, next);
});

// Request timeout - configurable via environment variable
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '600000', 10); // Default: 10 minutes
console.log("⏱️  Request timeout:", REQUEST_TIMEOUT, "ms", `(${REQUEST_TIMEOUT / 1000}s)`);

app.use((req, res, next) => {
  // Skip timeout for video upload endpoints (they handle their own timeout)
  if (req.path.includes('/upload/video-chunk')) {
    return next();
  }
  requestTimeoutGuard(REQUEST_TIMEOUT)(req, res, next);
});

// Body parser - Large limits for video uploads
app.use(express.json({ limit: '5368709120' })); // 5GB
app.use(express.urlencoded({ extended: true, limit: '5368709120' })); // 5GB

// Apply rate limiting to all API routes (except uploads)
app.use('/api', (req, res, next) => {
  if (req.path.includes('/upload/video-chunk')) {
    return next();
  }
  apiLimiter(req, res, next);
});

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "../uploads");
console.log("📁 Serving uploads from:", uploadsPath);

app.use("/uploads", express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  },
  fallthrough: false,
}));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Database connection test
app.get("/health/db", async (req, res) => {
  try {
    const { testDatabaseConnection } = await import("./utils/dbTest.js");
    const result = await testDatabaseConnection();
    if (result.connected) {
      res.json({
        status: "OK",
        database: "connected",
        userCount: result.userCount,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        status: "ERROR",
        database: "disconnected",
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check routes
import healthRoutes from "./routes/health.js";
app.use("/health", healthRoutes);

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public app routes
import appRoutes from "./routes/app.js";
app.use("/api/app", appRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/upload", videoUploadRoutes); // Video upload routes
app.use("/api/admin", adminRoutes);

// Mobile routes
app.use("/api/mobile/public", publicMobileRoutes);
app.use("/api/mobile/student", studentMobileRoutes);
app.use("/api/mobile/teacher", teacherMobileRoutes);
app.use("/api/mobile/admin", adminMobileRoutes);
app.use("/api/web", webRoutes);
app.use("/api/notifications", notificationLimiter);
app.use("/api", profileRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// Prisma setup
import prisma from './config/database.js';
import { getPrismaHealthStatus } from './utils/prismaHealthCheck.js';

const verifyPrismaModels = async () => {
  try {
    const health = getPrismaHealthStatus();
    if (!health.healthy) {
      console.warn('⚠️  Some Prisma models are missing. Features may not work correctly.');
      console.warn('⚠️  To fix: Run "npm run prisma:generate" on the server');
    } else {
      console.log('✅ All Prisma models are available');
    }
  } catch (error) {
    console.error('❌ Error verifying Prisma models:', error.message);
  }
};

verifyPrismaModels();

// Create HTTP server with extended timeouts for video uploads
const HOST = "0.0.0.0";
const localIP = getLocalIPAddress();

const server = http.createServer(app);

// CRITICAL: Extended timeouts for large video uploads
server.timeout = 1800000; // 30 minutes
server.keepAliveTimeout = 1800000; // 30 minutes  
server.headersTimeout = 1900000; // 31 minutes (must be > keepAliveTimeout)

console.log("⏱️  Server timeout:", server.timeout / 1000, "seconds");
console.log("⏱️  Keep-alive timeout:", server.keepAliveTimeout / 1000, "seconds");

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Local access: http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://${localIP}:${PORT}`);
  console.log(`📚 API Documentation: http://${localIP}:${PORT}/api-docs`);
  console.log(`\n💡 Share this IP with others on your WiFi: ${localIP}:${PORT}`);
  
  // Start scheduled jobs
  if (process.env.NODE_ENV !== 'test') {
    import('./jobs/courseExpirationJob.js').then(({ startCourseExpirationJob }) => {
      startCourseExpirationJob();
    }).catch(err => {
      console.error('Error starting scheduled jobs:', err);
    });
  }
});

export default app;