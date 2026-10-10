
import "dotenv/config";

import { connectDB } from "../db/mongodb";
import { runEvaluation } from "./evaluator";
import { calculateMetrics } from "./metrics";

async function main() {
  const patientId = process.env.EVALUATION_PATIENT_ID;

  if (!patientId) {
    throw new Error(
      "EVALUATION_PATIENT_ID is missing from your environment."
    );
  }

  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("MongoDB connected successfully.");

  const results = await runEvaluation({
    patientId,
    currentDate: "2026-10-09",
    currentDay: "Friday",
    currentDateTime: "2026-10-09T16:00:00+05:30",
  scenarios: (await import("./scenarios")).evaluationScenarios,
  });

  const metrics = calculateMetrics(results);

  console.log("\n===== EVALUATION RESULTS =====");

  for (const result of results) {
    console.log(
      `\n${result.passed ? "PASS" : "FAIL"}: ${result.scenarioId}`
    );

    for (const check of result.checks) {
      console.log(
        `  ${check.passed ? "✓" : "✗"} ${check.name}`
      );

      if (check.details) {
        console.log(`    ${check.details}`);
      }
    }
  }

  console.log("\n===== SUMMARY =====");
  console.log(`Total scenarios: ${metrics.total}`);
  console.log(`Passed: ${metrics.passed}`);
  console.log(`Failed: ${metrics.failed}`);
  console.log(`Pass rate: ${metrics.passRate}%`);

  if (metrics.failed > 0) {
    console.log(
      "Failed scenarios:",
      metrics.failedScenarioIds.join(", ")
    );
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Evaluation runner failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  });