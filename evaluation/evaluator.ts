
import { runAgent } from "@/agent/agent";
import type { AppointmentState } from "@/agent/state";
import { evaluationScenarios } from "./scenarios";
import type { EvaluationScenario } from "./scenarios";
import type { ScenarioResult } from "./metrics";

type EvaluatorOptions = {
  patientId: string;
  currentDate: string;
  currentDay: string;
  currentDateTime: string;
  scenarios?: EvaluationScenario[];
  enableMissingDetailsGuardrail?: boolean;
};

async function runAgentWithRetry(
  input: Parameters<typeof runAgent>[0],
  maxRetries = 2
) {
  let attempt = 0;

  while (true) {
    try {
      return await runAgent(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      const isRateLimit =
        message.includes("429") ||
        message.includes("RESOURCE_EXHAUSTED") ||
        message.toLowerCase().includes("rate limit");

      if (!isRateLimit || attempt >= maxRetries) {
        throw error;
      }

      attempt++;

      // Wait 45 seconds before retrying a rate-limited request.
      const delayMs = 45_000;

      console.warn(
        `Gemini rate limit hit. Retry ${attempt}/${maxRetries} in 45 seconds...`
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function evaluateScenario(
  scenario: EvaluationScenario,
  options: EvaluatorOptions
): Promise<ScenarioResult> {
  const messages: {
    role: "user" | "assistant";
    content: string;
  }[] = [];

  let appointmentState: AppointmentState = {};
  const toolNames = new Set<string>();
  const checks: ScenarioResult["checks"] = [];
  let lastResponse = "";

  for (const [index, userMessage] of scenario.messages.entries()) {
  console.log(
    `    [${scenario.id}] Turn ${index + 1}/${scenario.messages.length}: calling Gemini...`
  );

  messages.push({
    role: "user",
    content: userMessage,
  });

  const startedAt = Date.now();

  const result = await runAgentWithRetry(
  {
    messages,
    patientId: options.patientId,
    appointmentState,
    currentDate: options.currentDate,
    currentDay: options.currentDay,
    currentDateTime: options.currentDateTime,
    enableMissingDetailsGuardrail:
      options.enableMissingDetailsGuardrail ?? false,
  },
  2
);

  console.log(
    `    [${scenario.id}] Turn ${index + 1} completed in ${(
      (Date.now() - startedAt) /
      1000
    ).toFixed(1)}s`
  );

  lastResponse = result.text;
  console.log(`[${scenario.id}] Agent response: ${result.text}`);
  appointmentState = result.appointmentState;

  for (const trace of result.toolTrace) {
    toolNames.add(trace.toolName);
  }

  messages.push({
    role: "assistant",
    content: result.text,
  });
}

  const response = lastResponse.toLowerCase();

  for (const term of scenario.expectedResponseTerms ?? []) {
    const passed = response.includes(term.toLowerCase());

    checks.push({
      name: `Response includes "${term}"`,
      passed,
    });
  }

  for (const term of scenario.forbiddenResponseTerms ?? []) {
    const passed = !response.includes(term.toLowerCase());

    checks.push({
      name: `Response excludes "${term}"`,
      passed,
    });
  }

  for (const toolName of scenario.mustCallTools ?? []) {
    const passed = toolNames.has(toolName);

    checks.push({
      name: `Tool called: ${toolName}`,
      passed,
    });
  }

  for (const toolName of scenario.mustNotCallTools ?? []) {
    const passed = !toolNames.has(toolName);

    checks.push({
      name: `Tool not called: ${toolName}`,
      passed,
    });
  }

  if (scenario.expectBookingState) {
    const passed =
      appointmentState.confirmationStatus ===
      scenario.expectBookingState;

    checks.push({
      name: `Booking state is ${scenario.expectBookingState}`,
      passed,
      details: `Actual state: ${
        appointmentState.confirmationStatus ?? "UNSET"
      }`,
    });
  }
  for (const check of checks) {
  if (!check.passed) {
    console.log(
      `[${scenario.id}] FAILED CHECK: ${check.name}`,
      check.details ?? ""
    );
  }
}
  return {
    scenarioId: scenario.id,
    passed: checks.length > 0 && checks.every((check) => check.passed),
    status:
    checks.length > 0 && checks.every((check) => check.passed)
      ? "passed"
      : "failed",
    checks,
  };
}

export async function runEvaluation(options: EvaluatorOptions) {
  const scenarios = options.scenarios ?? evaluationScenarios;
  const results: ScenarioResult[] = [];

  for (const [index, scenario] of scenarios.entries()) {
    console.log(
      `\n[${index + 1}/${scenarios.length}] Starting scenario: ${scenario.id}`
    );

    try {
      const result = await evaluateScenario(scenario, options);
      results.push(result);

      console.log(
        `[${index + 1}/${scenarios.length}] Finished: ${
          result.passed ? "PASS" : "FAIL"
        } — ${scenario.id}`
      );
    
} catch (error) {
  const details =
    error instanceof Error ? error.message : "Unknown evaluation error";

  console.error(`Scenario error — ${scenario.id}:`, details);

  results.push({
    scenarioId: scenario.id,
    passed: false,
    status: "error",
    checks: [
      {
        name: "Scenario execution",
        passed: false,
        details,
      },
    ],
  });
}
  }

  return results;
}