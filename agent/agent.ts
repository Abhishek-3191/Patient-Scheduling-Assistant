import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  Type,
  type Tool,
  type Content,
} from "@google/genai";

import { buildSystemPrompt } from "./prompt";
import {
  type AppointmentState,
  type CandidateDoctor,
} from "./state";

import { findDoctorsTool } from "./tools/findDoctors";
import { checkAvailabilityTool } from "./tools/checkAvailability";
import { bookAppointmentTool } from "./tools/bookAppointment";
import { cancelAppointmentTool } from "./tools/cancelAppointment";
import { rescheduleAppointmentTool } from "./tools/rescheduleAppointment";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({ apiKey });

export type ChatMessage = {
  role: "user" | "assistant" | "model";
  content: string;
};

export type ToolTrace = {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
};

export type RunAgentInput = {
  messages: ChatMessage[];
  patientId: string;
  appointmentState: AppointmentState;
  currentDate: string;
  currentDay: string;
  currentDateTime: string;
  enableMissingDetailsGuardrail?: boolean;
};

type ToolExecutionInput = RunAgentInput & {
  appointmentState: AppointmentState;
};

type AgentResult = {
  type: "message";
  text: string;
  toolTrace: ToolTrace[];
  appointmentState: AppointmentState;
};

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "find_doctors",
        description:
          "Find doctors by speciality or name. Reuse the speciality from the existing conversation when relevant. If multiple doctors match, present the options and ask the patient to choose.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            speciality: {
              type: Type.STRING,
              description:
                "Medical speciality, such as Dermatology, Cardiology, Pediatrics, ENT, or Orthopedics.",
            },
            doctorName: {
              type: Type.STRING,
              description:
                "Doctor's name or surname if specified by the patient.",
            },
          },
        },
      },
      {
        name: "check_availability",
       description:
      "Check actual available one-hour slots for a specific doctor on a specific date. When the patient asks which of multiple matching doctors is available, call this tool separately for EVERY matching doctor before answering. Compare the requested time against each doctor's returned availableSlots. Never claim a doctor is available unless that exact time appears in their returned slots. Never invent availability.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            doctorId: {
              type: Type.STRING,
              description: "MongoDB ID of the doctor.",
            },
            date: {
              type: Type.STRING,
              description: "Appointment date in YYYY-MM-DD format.",
            },
          },
          required: ["doctorId", "date"],
        },
      },
      {
        name: "book_appointment",
        description:
          "Book an appointment only after the patient explicitly confirms the selected doctor, date, and time. The backend independently validates the booking.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            doctorId: {
              type: Type.STRING,
              description: "MongoDB ID of the selected doctor.",
            },
            date: {
              type: Type.STRING,
              description: "Appointment date in YYYY-MM-DD format.",
            },
            startTime: {
              type: Type.STRING,
              description: "Start time in HH:mm format.",
            },
            endTime: {
              type: Type.STRING,
              description: "End time in HH:mm format.",
            },
            confirmation: {
              type: Type.BOOLEAN,
              description:
                "True only when the latest patient message explicitly authorizes booking in context.",
            },
          },
          required: [
            "doctorId",
            "date",
            "startTime",
            "endTime",
            "confirmation",
          ],
        },
      },
      {
        name: "cancel_appointment",
        description:
          "Cancel an existing appointment belonging to the current patient. The backend validates ownership.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            appointmentId: {
              type: Type.STRING,
              description: "ID of the appointment to cancel.",
            },
          },
          required: ["appointmentId"],
        },
      },
      {
        name: "reschedule_appointment",
        description:
          "Reschedule an existing appointment to a new date and time. The backend validates ownership and availability.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            appointmentId: {
              type: Type.STRING,
              description: "ID of the existing appointment.",
            },
            newDate: {
              type: Type.STRING,
              description: "New date in YYYY-MM-DD format.",
            },
            newStartTime: {
              type: Type.STRING,
              description: "New start time in HH:mm format.",
            },
            newEndTime: {
              type: Type.STRING,
              description: "New end time in HH:mm format.",
            },
          },
          required: [
            "appointmentId",
            "newDate",
            "newStartTime",
            "newEndTime",
          ],
        },
      },
    ],
  },
];

/**
 * Returns true only when the latest user message confirms booking.
 *
 * A bare "yes" is accepted only when the preceding assistant message
 * clearly asked the patient to confirm or book the appointment.
 */
function hasExplicitBookingConfirmation(
  messages: ChatMessage[]
): boolean {
  const lastUserIndex = messages.findLastIndex(
    (message) => message.role === "user"
  );

  if (lastUserIndex < 0) {
    return false;
  }

  const latestUserMessage =
    messages[lastUserIndex].content.trim().toLowerCase();

  const explicitPhrases =
    /\b(yes,?\s*(please\s*)?(book|confirm|schedule)\b|please\s+(book|confirm|schedule)\b|go ahead and (book|confirm|schedule)\b|confirm the appointment\b|book it\b|please proceed with the booking\b)/i;

  if (explicitPhrases.test(latestUserMessage)) {
    return true;
  }

  const isShortConfirmation =
    /^(yes|yes please|confirm|confirmed|go ahead|please do|do it|sure)$/i.test(
      latestUserMessage
    );

  if (!isShortConfirmation) {
    return false;
  }

  const previousAssistantMessage = messages
    .slice(0, lastUserIndex)
    .findLast(
      (message) =>
        message.role === "assistant" ||
        message.role === "model"
    );

  if (!previousAssistantMessage) {
    return false;
  }

  return /\b(book|booking|confirm|confirmation|schedule this appointment)\b/i.test(
    previousAssistantMessage.content
  );
}

/**
 * Executes one of the agent's approved tools.
 * The LLM cannot directly access the database.
 */
async function executeTool(
  name: string,
  args: Record<string, any>,
  input: ToolExecutionInput
): Promise<unknown> {
  switch (name) {
    case "find_doctors": {
      return findDoctorsTool({
        speciality:
          args.speciality ??
          input.appointmentState.speciality,
        doctorName: args.doctorName,
      });
    }

    case "check_availability": {
      return checkAvailabilityTool({
        doctorId:
          args.doctorId ??
          input.appointmentState.doctorId,
        date:
          args.date ??
          input.appointmentState.date,
      });
    }

    case "book_appointment": {
      const explicitlyConfirmed =
        args.confirmation === true &&
        hasExplicitBookingConfirmation(input.messages);

      return bookAppointmentTool({
        patientId: input.patientId,
        state: {
          ...input.appointmentState,
          doctorId:
            args.doctorId ??
            input.appointmentState.doctorId,
          date:
            args.date ??
            input.appointmentState.date,
          startTime:
            args.startTime ??
            input.appointmentState.startTime,
          endTime:
            args.endTime ??
            input.appointmentState.endTime,
          confirmationStatus: explicitlyConfirmed
            ? "CONFIRMED"
            : "PENDING",
        },
      });
    }

    case "cancel_appointment": {
      return cancelAppointmentTool({
        patientId: input.patientId,
        appointmentId:
          args.appointmentId ??
          input.appointmentState.appointmentId,
      });
    }

    case "reschedule_appointment": {
      return rescheduleAppointmentTool({
        patientId: input.patientId,
        appointmentId:
          args.appointmentId ??
          input.appointmentState.appointmentId,
        newDate: args.newDate,
        newStartTime: args.newStartTime,
        newEndTime: args.newEndTime,
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/**
 * Updates the state from actual tool results.
 * Do not infer successful booking from the model's text.
 */
function updateStateFromTool(
  state: AppointmentState,
  toolName: string,
  args: Record<string, any>,
  result: any
): AppointmentState {
  const nextState: AppointmentState = {
    ...state,
  };

  if (toolName === "find_doctors" && result?.success) {
    const doctors: CandidateDoctor[] =
      result.doctors ?? [];

    nextState.candidateDoctors = doctors;

    if (args.speciality) {
      nextState.speciality = args.speciality;
    }

    // Select automatically only when exactly one doctor matches.
    if (doctors.length === 1) {
      nextState.doctorId = doctors[0].id;
      nextState.doctorName = doctors[0].name;
      nextState.speciality = doctors[0].speciality;
    } else if (doctors.length > 1) {
      // Multiple matches require the patient's choice.
      nextState.doctorId = undefined;
      nextState.doctorName = undefined;
    }
  }

  if (toolName === "check_availability") {
    if (result?.success) {
      nextState.doctorId =
        args.doctorId ?? nextState.doctorId;

      nextState.date =
        args.date ?? nextState.date;

      if (result.doctor) {
        nextState.doctorName = result.doctor;
      }

      if (result.speciality) {
        nextState.speciality = result.speciality;
      }
    }
  }

  if (toolName === "book_appointment") {
    nextState.doctorId =
      args.doctorId ?? nextState.doctorId;

    nextState.date =
      args.date ?? nextState.date;

    nextState.startTime =
      args.startTime ?? nextState.startTime;

    nextState.endTime =
      args.endTime ?? nextState.endTime;

    if (result?.success && result.appointment) {
      nextState.appointmentId = result.appointment.id;
      nextState.doctorName =
        result.appointment.doctorName ??
        nextState.doctorName;

      nextState.speciality =
        result.appointment.speciality ??
        nextState.speciality;

      nextState.confirmationStatus = "CONFIRMED";
    } else {
      // Failed bookings must not be marked as confirmed.
      nextState.confirmationStatus = "PENDING";
    }
  }

  if (toolName === "cancel_appointment") {
    if (result?.success) {
      nextState.intent = "CANCEL";
      nextState.confirmationStatus = undefined;
    }
  }

  if (
    toolName === "reschedule_appointment" &&
    result?.success
  ) {
    nextState.intent = "RESCHEDULE";
    nextState.date = args.newDate;
    nextState.startTime = args.newStartTime;
    nextState.endTime = args.newEndTime;
  }

  return nextState;
}

export async function runAgent(
  input: RunAgentInput
): Promise<AgentResult> {
  // Work on a local copy. The API route persists the returned state.
  let currentState: AppointmentState = {
    ...input.appointmentState,
  };
  if (!currentState.confirmationStatus) {
  currentState.confirmationStatus = "PENDING";
}

  // Gemini expects user/model roles, not user/assistant roles.
  const contents: Content[] = input.messages.map((message) => ({
    role:
      message.role === "assistant" || message.role === "model"
        ? "model"
        : "user",
    parts: [{ text: message.content }],
  }));

  const toolTrace: ToolTrace[] = [];
  const MAX_TOOL_ROUNDS = 5;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const systemInstruction = buildSystemPrompt({
      currentDate: input.currentDate,
      currentDay: input.currentDay,
      currentDateTime: input.currentDateTime,
      appointmentState: currentState,
       enableMissingDetailsGuardrail:input.enableMissingDetailsGuardrail ?? false,
    });


    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction,
        tools,
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          },
        },
      },
    });

    const candidate = response.candidates?.[0];

    if (!candidate?.content) {
      throw new Error("Gemini returned an empty response.");
    }

    const modelContent = candidate.content;
    const functionCalls = response.functionCalls ?? [];

    // Gemini has produced the final user-facing response.
    if (functionCalls.length === 0) {
      return {
        type: "message",
        text:
          response.text ??
          "I wasn't able to process that request. Please try again.",
        toolTrace,
        appointmentState: currentState,
      };
    }

    // Keep the model's function-call content in the conversation.
    contents.push({
      role: "model",
      parts: modelContent.parts ?? [],
    });

    const functionResponses: NonNullable<Content["parts"]> = [];

    for (const functionCall of functionCalls) {
      const name = functionCall.name;

      if (!name) {
        continue;
      }

      const args = (functionCall.args ?? {}) as Record<
        string,
        any
      >;

      let toolResult: unknown;

      try {
        toolResult = await executeTool(name, args, {
          ...input,
          appointmentState: currentState,
        });
      } catch (error) {
        console.error(`Tool ${name} failed:`, error);

        toolResult = {
          success: false,
          error:
            "The requested operation failed. Please try again.",
        };
      }

      toolTrace.push({
        toolName: name,
        args,
        result: toolResult,
      });

      currentState = updateStateFromTool(
        currentState,
        name,
        args,
        toolResult
      );

      functionResponses.push({
        functionResponse: {
          ...(functionCall.id ? { id: functionCall.id } : {}),
          name,
          response: {
            result: toolResult,
          },
        },
      });
    }

    // Send tool results back to Gemini for the next turn.
    if (functionResponses.length > 0) {
      contents.push({
        role: "user",
        parts: functionResponses,
      });
    }
  }

  return {
    type: "message",
    text:
      "I couldn't complete the request safely. Please try again.",
    toolTrace,
    appointmentState: currentState,
  };
}
