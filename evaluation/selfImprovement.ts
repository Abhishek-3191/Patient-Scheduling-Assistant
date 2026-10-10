import { runEvaluation } from "./evaluator";
import { calculateMetrics, compareMetrics } from "./metrics";

type SelfImprovementOptions = {
  patientId: string;
  currentDate: string;
  currentDay: string;
  currentDateTime: string;
};

export async function runImprovementComparison(
  options: SelfImprovementOptions
) {
  console.log("\n========== BASELINE RUN ==========\n");

  // Run the original agent without the new guardrail.
  const baselineResults = await runEvaluation({
    ...options,
    enableMissingDetailsGuardrail: false,
  });

  const baselineMetrics = calculateMetrics(baselineResults);

  console.log("\n========== IMPROVED RUN ==========\n");

  // Rerun the same evaluation with the guardrail enabled.
  console.log("\nWaiting 60 seconds for Gemini rate limits to reset...");

await new Promise((resolve) => setTimeout(resolve, 60_000));

const improvedResults = await runEvaluation({
  ...options,
  enableMissingDetailsGuardrail: true,
});

  const improvedMetrics = calculateMetrics(improvedResults);

  const comparison = compareMetrics(
    baselineMetrics,
    improvedMetrics
  );

  console.log("\n========== COMPARISON ==========\n");
  console.log("Baseline metrics:", baselineMetrics);
  console.log("Improved metrics:", improvedMetrics);
  console.log("Comparison:", comparison);

  
if (!comparison.comparable) {
  console.log(
    "\nINCOMPLETE COMPARISON: infrastructure errors occurred. Rerun before judging improvement."
  );
} else if (comparison.hasRegression) {
  console.log(
    "\nWARNING: The improved run introduced a regression."
  );
} else if (comparison.improvementInPercentagePoints > 0) {
  console.log(
    "\nImprovement detected without a reported regression."
  );
} else {
  console.log(
    "\nNo measurable improvement detected. More investigation is needed."
  );
}

  return {
    baseline: {
      metrics: baselineMetrics,
      results: baselineResults,
    },
    improved: {
      metrics: improvedMetrics,
      results: improvedResults,
    },
    comparison,
  };
}