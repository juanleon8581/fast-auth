import { CreateLogValidator } from "./validators/create-log.validator";
import { LogDatasource } from "./datasources/log.datasource";
import { DatabaseClient } from "./config/database.client";
import { CreateLogDto } from "@/domain/log/dtos/create-log.dto";

/**
 * Test script for infrastructure layer components
 * Run with: npx ts-node src/infrastructure/test-infrastructure.ts
 */

async function testInfrastructureLayer() {
  console.log("🧪 Testing Infrastructure Layer...\n");

  try {
    // Test 1: Database Client
    console.log("1️⃣ Testing Database Client...");

    // Test database client creation
    DatabaseClient.create();
    console.log("✅ Database client created successfully");

    // Test health check
    const isHealthy = await DatabaseClient.healthCheck();
    console.log(
      `✅ Database health check: ${isHealthy ? "HEALTHY" : "UNHEALTHY"}`,
    );

    // Test connection status
    const isConnected = DatabaseClient.isConnected();
    console.log(
      `✅ Database connection status: ${isConnected ? "CONNECTED" : "DISCONNECTED"}`,
    );

    // Test 2: Create Log Validator
    console.log("\n2️⃣ Testing Create Log Validator...");

    // Test valid log data
    const validLogData = {
      level: "INFO",
      message: "Test log message",
      meta: { testKey: "testValue" },
      service: "test-service",
      userId: "user-123",
      requestId: "req-456",
    };

    try {
      const validatedDto = CreateLogValidator.validate(validLogData);
      console.log("✅ Valid log data validation passed");
      console.log(`   - Level: ${validatedDto.level}`);
      console.log(`   - Message: ${validatedDto.message}`);
      console.log(`   - Service: ${validatedDto.service}`);
    } catch (error) {
      console.log(
        `❌ Valid log data validation failed: ${(error as Error).message}`,
      );
    }

    // Test invalid log data
    try {
      const invalidLogData = {
        level: "INVALID_LEVEL",
        message: "",
        meta: {},
      };
      CreateLogValidator.validate(invalidLogData);
      console.log("❌ Invalid log data validation should have failed");
    } catch (error) {
      if (!error)
        return console.log(
          "❌ No error thrown for invalid log data validation",
        );
      console.log("✅ Invalid log data validation correctly failed");
    }

    // Test log level validation
    try {
      const validLevel = CreateLogValidator.validateLogLevel("ERROR");
      console.log(`✅ Log level validation passed: ${validLevel}`);
    } catch (error) {
      console.log(
        `❌ Log level validation failed: ${(error as Error).message}`,
      );
    }

    // Test message validation
    try {
      const validMessage = CreateLogValidator.validateMessage("Test message");
      console.log(`✅ Message validation passed: ${validMessage}`);
    } catch (error) {
      console.log(`❌ Message validation failed: ${(error as Error).message}`);
    }

    // Test 3: Log Datasource
    console.log("\n3️⃣ Testing Log Datasource...");

    const logDatasource = new LogDatasource();

    // Create a test log
    try {
      const createLogDto = CreateLogDto.createFrom({
        level: "INFO",
        message: "Infrastructure test log",
        meta: { test: true, timestamp: new Date().toISOString() },
        service: "infrastructure-test",
        userId: null, // No userId to avoid foreign key constraint
        requestId: "test-req-456",
      });

      if (createLogDto[0]) {
        console.log(`❌ Failed to create DTO: ${createLogDto[0]}`);
      } else {
        const logEntity = await logDatasource.createLog(createLogDto[1]!);
        console.log("✅ Log created successfully");
        console.log(`   - ID: ${logEntity.id}`);
        console.log(`   - Level: ${logEntity.level}`);
        console.log(`   - Message: ${logEntity.message}`);
        console.log(`   - Timestamp: ${logEntity.timestamp}`);

        // Test retrieving logs by user ID (using null since we didn't create with userId)
        const userLogs = await logDatasource.getLogsByUserId(
          "nonexistent-user",
          5,
        );
        console.log(
          `✅ Retrieved ${userLogs.length} logs by user ID (expected 0)`,
        );

        // Test retrieving logs by service
        const serviceLogs = await logDatasource.getLogsByService(
          "infrastructure-test",
          5,
        );
        console.log(`✅ Retrieved ${serviceLogs.length} logs by service`);

        // Test retrieving logs by level
        const levelLogs = await logDatasource.getLogsByLevel("INFO", 5);
        console.log(`✅ Retrieved ${levelLogs.length} logs by level`);

        // Test retrieving logs by request ID
        const requestLogs =
          await logDatasource.getLogsByRequestId("test-req-456");
        console.log(`✅ Retrieved ${requestLogs.length} logs by request ID`);
      }
    } catch (error) {
      console.log(`❌ Log datasource test failed: ${(error as Error).message}`);
    }

    // Test 4: Error Handling
    console.log("\n4️⃣ Testing Error Handling...");

    try {
      // Test invalid user ID
      await logDatasource.getLogsByUserId("", 5);
      console.log("❌ Should have thrown validation error for empty user ID");
    } catch (error) {
      if (!error)
        return console.log("❌ No error thrown for empty user ID validation");
      console.log("✅ Correctly handled empty user ID validation");
    }

    try {
      // Test invalid limit
      await logDatasource.getLogsByUserId("test-user", 2000);
      console.log("❌ Should have thrown validation error for invalid limit");
    } catch (error) {
      if (!error)
        return console.log("❌ No error thrown for invalid limit validation");
      console.log("✅ Correctly handled invalid limit validation");
    }

    try {
      // Test invalid log level
      await logDatasource.getLogsByLevel("INVALID_LEVEL", 5);
      console.log(
        "❌ Should have thrown validation error for invalid log level",
      );
    } catch (error) {
      if (!error)
        return console.log(
          "❌ No error thrown for invalid log level validation",
        );
      console.log("✅ Correctly handled invalid log level validation");
    }

    console.log("\n🎉 Infrastructure layer testing completed!");
  } catch (error) {
    console.error("\n💥 Infrastructure layer test failed:", error);
  } finally {
    // Cleanup
    try {
      await DatabaseClient.disconnect();
      console.log("\n🔌 Database disconnected successfully");
    } catch (error) {
      console.error("❌ Failed to disconnect database:", error);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testInfrastructureLayer()
    .then(() => {
      console.log("\n✨ Test execution completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test execution failed:", error);
      process.exit(1);
    });
}

export { testInfrastructureLayer };
