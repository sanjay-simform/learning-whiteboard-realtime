import "reflect-metadata";
import app from "./app";
import { createWebSocketServer } from "websocket/app";
import { AppDataSource } from "db/data-source";
import { ENV } from "config/env";

const startServer = async () => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected");

    // Start server
    const server = app.listen(ENV.PORT, () => {
      console.log(`Server running on http://localhost:${ENV.PORT}`);
      console.log(`Environment: ${ENV.NODE_ENV}`);
    });
    createWebSocketServer(server);
    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await AppDataSource.destroy();
        // process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
