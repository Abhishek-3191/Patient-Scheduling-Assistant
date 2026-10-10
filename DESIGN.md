# Design Note — Patient Appointment Scheduling Agent

## Key Design Choices

I built a multi-turn appointment scheduling agent using Next.js, TypeScript, Gemini, and MongoDB. The agent uses tools to find doctors, check availability, and book, cancel, or reschedule appointments. I separated the agent logic, system prompt, conversation state, and evaluation harness to make the application easier to maintain and debug.

The agent is designed to clarify missing details, verify appointment availability, and ask for explicit patient confirmation before booking. These requirements are especially important because an incorrect booking can affect a patient's care.

## Evaluation and Improvement Loop

I created eight evaluation scenarios covering doctor discovery, doctor selection, ambiguous requests, missing details, premature booking, explicit confirmation, weekend handling, and unavailable slots. The evaluator checks expected response terms and required or forbidden tool calls.

The improvement loop runs the same scenarios twice: first with the baseline configuration, then with an additional missing-details guardrail enabled. It calculates pass rates, compares failed scenarios, and reports newly introduced failures to help identify regressions.

* **Before:** 6/8 scenarios passed — 75% (approximately 75%).
* **After:** 7/8 scenarios passed — 87.5% (approximately 88%).
* **Measured improvement:** 13 percentage points; no new failures were reported.

The missing-details scenario revealed that evaluation assertions must accurately measure behavior rather than depend on overly specific wording. The current result does not demonstrate a measurable improvement. My next step is to strengthen the safety tests to verify actual booking side effects in addition to tool calls and response text.

## Production Improvement

For a real clinic, I would prioritize enforcing explicit confirmation and appointment availability in server-side booking logic. The server should verify that the patient confirmed the exact doctor, date, and time, then recheck availability before creating the appointment. This prevents the language model alone from controlling a consequential action.

## AI Assistance and Engineering Judgment

AI helped accelerate the implementation of conversational flows, tool integration, and evaluation scenarios. My engineering judgment guided the safety requirements, review of test results, and investigation of failures. Rather than treating a higher score as proof of success, I distinguished wording mismatches from genuine behavior failures. I would consider the improvement complete only after the same test suite demonstrates better results without regressions.
