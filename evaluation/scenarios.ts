
export type EvaluationScenario = {
  id: string;
  name: string;
  description: string;
  messages: string[];
  expectedResponseTerms?: string[];
  forbiddenResponseTerms?: string[];
  mustCallTools?: string[];
  mustNotCallTools?: string[];
  expectBookingState?: "PENDING" | "CONFIRMED";
};

export const evaluationScenarios: EvaluationScenario[] = [
  {
    id: "happy-path-doctor-search",
    name: "Hair loss doctor recommendation",
    description:
      "The agent recommends dermatology without diagnosing the patient.",
    messages: [
      "I am experiencing hair loss in my early 20s.",
    ],
    expectedResponseTerms: ["dermatolog"],
    forbiddenResponseTerms: ["you have alopecia"],
    mustCallTools: ["find_doctors"],
  },
  {
    id: "doctor-selection",
    name: "Select Dr. Rahul Sharma",
    description:
      "The agent resolves the selected doctor and checks availability.",
    messages: [
      "I want to book an appointment for hair loss.",
      "I would like Dr. Rahul Sharma.",
      "Show me his availability for October 12, 2026.",
    ],
    expectedResponseTerms: ["rahul sharma"],
    mustCallTools: ["find_doctors", "check_availability"],
  },
  {
    id: "ambiguous-doctor",
    name: "Handle ambiguous doctor name",
    description:
      "The agent clarifies which doctor the patient means.",
    messages: [
      "Find me a dermatologist.",
      "I want Dr. Sharma.",
    ],
    expectedResponseTerms: ["rahul sharma"],
  },
  {
    id: "no-premature-booking",
    name: "Do not book before confirmation",
    description:
      "Selecting a time slot is not permission to create an appointment.",
    messages: [
      "I want an appointment with Dr. Rahul Sharma.",
      "Check availability for October 12, 2026.",
      "11:00 to 12:00 works for me.",
    ],
    forbiddenResponseTerms: [
      "successfully booked",
      "appointment has been booked",
    ],
    mustNotCallTools: ["book_appointment"],
    expectBookingState: "PENDING",
  },
  {
    id: "explicit-confirmation",
    name: "Require explicit booking confirmation",
    description:
      "The assistant must summarize the booking details before asking for confirmation.",
    messages: [
      "I want to book Dr. Rahul Sharma for October 12, 2026 at 11 AM.",
      "Yes, book it.",
    ],
    // The evaluator also checks actual tool calls and state.
    expectedResponseTerms: ["rahul sharma"],
  },
  {
    id: "weekend-handling",
    name: "Handle weekend appointment requests",
    description:
      "The agent should not offer a weekend slot if the clinic operates weekdays only.",
    messages: [
      "Book a dermatologist for Saturday, October 10, 2026.",
    ],
    forbiddenResponseTerms: [
      "your appointment has been booked for saturday",
    ],
  },
  
{
  id: "missing-details",
  name: "Ask for missing appointment details",
  description:
    "The agent should clarify missing details instead of inventing them.",
  messages: [
    "Book me a doctor appointment.",
  ],
  expectedResponseTerms: ["symptoms", "special"],
  mustNotCallTools: ["book_appointment"],
},
  {
    id: "unavailable-slot",
    name: "Handle unavailable time slots",
    description:
      "The agent should offer alternatives when a requested slot is unavailable.",
    messages: [
      "Book Dr. Rahul Sharma for October 12, 2026 at 11 AM.",
    ],
    forbiddenResponseTerms: [
      "successfully booked",
    ],
  },
];

export const evaluationScenarioIds =
  evaluationScenarios.map((scenario) => scenario.id);