import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { db } from "@kdx/db/client";

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const startTime = Date.now();

    // Simple query to test database connection
    await db.execute("SELECT 1");

    const dbResponseTime = Date.now() - startTime;

    // Basic health check response
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: "healthy",
          responseTime: `${dbResponseTime}ms`,
        },
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
        },
      },
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);

    const errorData = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      checks: {
        database: {
          status: "unhealthy",
          error: error instanceof Error ? error.message : "Connection failed",
        },
        server: {
          status: "healthy",
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
        },
      },
    };

    return NextResponse.json(errorData, { status: 503 });
  }
}

// Support HEAD requests for lightweight health checks
export async function HEAD(request: NextRequest) {
  try {
    await db.execute("SELECT 1");
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);
    return new NextResponse(null, { status: 503 });
  }
}
