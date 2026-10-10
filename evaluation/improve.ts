
import "dotenv/config";
import mongoose from "mongoose";
import { runImprovementComparison } from "./selfImprovement";

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const result = await runImprovementComparison({
      patientId: "6ac6b4031e0b85a12c8d02be",
      currentDate: "2026-10-09",
      currentDay: "Friday",
      currentDateTime: "2026-10-09T16:00:00+05:30",
    });

    console.log("\n========== FINAL RESULT ==========\n");
    console.log(
      `Before pass rate: ${result.comparison.beforePassRate}%`
    );
    console.log(
      `After pass rate: ${result.comparison.afterPassRate}%`
    );
    console.log(
      `Improvement: ${result.comparison.improvementInPercentagePoints} percentage points`
    );
    console.log(
      `New failures: ${result.comparison.newFailures.length}`
    );
    console.log(
      `Resolved failures: ${result.comparison.resolvedFailures.length}`
    );
    console.log(
      `Regression detected: ${result.comparison.hasRegression}`
    );
  } catch (error) {
    console.error("Improvement loop failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();