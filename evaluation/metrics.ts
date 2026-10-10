
export type ScenarioResult = {
  scenarioId: string;
  passed: boolean;
  status?: "passed" | "failed" | "error";
  checks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];
};

export type EvaluationMetrics = {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  errors: number;
  passRate: number;
  failedScenarioIds: string[];
  errorScenarioIds: string[];
};

export function calculateMetrics(
  results: ScenarioResult[]
): EvaluationMetrics {
  const errors = results.filter(
    (result) => result.status === "error"
  );

  const completedResults = results.filter(
    (result) => result.status !== "error"
  );

  const passed = completedResults.filter(
    (result) => result.passed
  ).length;

  const failed = completedResults.length - passed;

  return {
    total: results.length,
    completed: completedResults.length,
    passed,
    failed,
    errors: errors.length,
    passRate:
      completedResults.length === 0
        ? 0
        : Math.round((passed / completedResults.length) * 100),
    failedScenarioIds: completedResults
      .filter((result) => !result.passed)
      .map((result) => result.scenarioId),
    errorScenarioIds: errors.map((result) => result.scenarioId),
  };
}

export function compareMetrics(
  before: EvaluationMetrics,
  after: EvaluationMetrics
) {
  const comparable =
    before.errors === 0 &&
    after.errors === 0 &&
    before.total === after.total;

  const newFailures = after.failedScenarioIds.filter(
    (id) => !before.failedScenarioIds.includes(id)
  );

  const resolvedFailures = before.failedScenarioIds.filter(
    (id) => !after.failedScenarioIds.includes(id)
  );

  return {
    comparable,
    beforePassRate: before.passRate,
    afterPassRate: after.passRate,
    improvementInPercentagePoints:
      after.passRate - before.passRate,
    newFailures,
    resolvedFailures,
    hasRegression: newFailures.length > 0,
  };
}