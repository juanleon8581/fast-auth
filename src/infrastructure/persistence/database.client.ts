import { PrismaClient } from "@prisma/client";
import { BadRequestError } from "@/domain/errors/bad-request-error";

export { UserRole } from "@prisma/client";

export type DatabaseClientType = PrismaClient;

interface DatabaseConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  enableLogging?: boolean;
  logLevel?: ("query" | "info" | "warn" | "error")[];
}

export class DatabaseClient {
  private static instance: PrismaClient | null = null;
  private static isConnecting = false;
  private static connectionPromise: Promise<PrismaClient> | null = null;

  /**
   * Creates or returns existing Prisma client instance
   */
  public static create(config?: DatabaseConfig): PrismaClient {
    if (DatabaseClient.instance) {
      return DatabaseClient.instance;
    }

    if (DatabaseClient.isConnecting && DatabaseClient.connectionPromise) {
      throw new BadRequestError("Database connection is already in progress");
    }

    try {
      const defaultConfig: DatabaseConfig = {
        maxConnections: 10,
        connectionTimeout: 10000,
        enableLogging: process.env.NODE_ENV !== "production",
        logLevel:
          process.env.NODE_ENV === "production"
            ? ["error", "warn"]
            : ["query", "info", "warn", "error"],
      };

      const finalConfig = { ...defaultConfig, ...config };

      DatabaseClient.instance = new PrismaClient({
        log: finalConfig.enableLogging ? finalConfig.logLevel : [],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

      // Add error handling for connection issues
      DatabaseClient.instance.$on("error" as never, (error: Error) => {
        console.error("Database error:", error);
      });

      return DatabaseClient.instance;
    } catch (error) {
      DatabaseClient.instance = null;
      throw new BadRequestError(
        `Failed to create database client: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Creates database connection asynchronously with proper error handling
   */
  public static async connect(config?: DatabaseConfig): Promise<PrismaClient> {
    if (DatabaseClient.instance) {
      return DatabaseClient.instance;
    }

    if (DatabaseClient.isConnecting && DatabaseClient.connectionPromise) {
      return DatabaseClient.connectionPromise;
    }

    DatabaseClient.isConnecting = true;

    try {
      DatabaseClient.connectionPromise = this.createConnection(config);
      const client = await DatabaseClient.connectionPromise;

      // Test the connection
      await client.$connect();

      DatabaseClient.instance = client;
      DatabaseClient.isConnecting = false;
      DatabaseClient.connectionPromise = null;

      return client;
    } catch (error) {
      DatabaseClient.isConnecting = false;
      DatabaseClient.connectionPromise = null;
      DatabaseClient.instance = null;

      throw new BadRequestError(
        `Failed to connect to database: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Disconnects from the database and cleans up resources
   */
  public static async disconnect(): Promise<void> {
    try {
      if (DatabaseClient.instance) {
        await DatabaseClient.instance.$disconnect();
        DatabaseClient.instance = null;
      }

      DatabaseClient.isConnecting = false;
      DatabaseClient.connectionPromise = null;
    } catch (error) {
      console.error("Error disconnecting from database:", error);
      // Force cleanup even if disconnect fails
      DatabaseClient.instance = null;
      DatabaseClient.isConnecting = false;
      DatabaseClient.connectionPromise = null;

      throw new BadRequestError(
        `Failed to disconnect from database: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Checks if the database client is connected
   */
  public static isConnected(): boolean {
    return DatabaseClient.instance !== null && !DatabaseClient.isConnecting;
  }

  /**
   * Gets the current database client instance (if exists)
   */
  public static getInstance(): PrismaClient | null {
    return DatabaseClient.instance;
  }

  /**
   * Performs a health check on the database connection
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      if (!DatabaseClient.instance) {
        return false;
      }

      // Simple query to test connection
      await DatabaseClient.instance.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  /**
   * Private method to create the actual connection
   */
  private static async createConnection(
    config?: DatabaseConfig,
  ): Promise<PrismaClient> {
    const defaultConfig: DatabaseConfig = {
      maxConnections: 10,
      connectionTimeout: 10000,
      enableLogging: process.env.NODE_ENV !== "production",
      logLevel:
        process.env.NODE_ENV === "production"
          ? ["error", "warn"]
          : ["query", "info", "warn", "error"],
    };

    const finalConfig = { ...defaultConfig, ...config };

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const client = new PrismaClient({
      log: finalConfig.enableLogging ? finalConfig.logLevel : [],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Add error handling
    client.$on("error" as never, (error: Error) => {
      console.error("Database error:", error);
    });

    return client;
  }
}
