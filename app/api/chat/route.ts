
import { NextResponse } from "next/server";

import { runAgent } from "@/agent/agent";
import { connectDB } from "@/db/mongodb";

import { findPatientByEmail } from "@/db/repositories/patientRepository";

import {
  findConversationBySessionId,
  updateConversation,
} from "@/db/repositories/conversationRepository";

type ToolTrace = {
  toolName: string;
  args: Record<string, unknown>;
  result: any;
};

type AgentResult = {
  text: string;
  toolTrace: ToolTrace[];
  appointmentState: any;
};

type Patient = {
  _id: { toString(): string };
  name: string;
  email: string;
};


function getStructuredResponse(
  result: AgentResult,
  patient: Patient,
  sessionId: string
) {
  const traces = result.toolTrace ?? [];

  // Find the most recent successful doctor search.
  const doctorResult = [...traces]
    .reverse()
    .find(
      (trace) =>
        trace.toolName === "find_doctors" &&
        trace.result?.success === true &&
        Array.isArray(trace.result?.doctors)
    );

  const doctors = doctorResult?.result?.doctors?.map(
    (doctor: any) => ({
      id: String(doctor.id ?? doctor._id),
      name: doctor.name,
      speciality: doctor.speciality,
      experience: doctor.experience,
    })
  );

  // Find the most recent successful availability check.
  const availabilityResult = [...traces]
    .reverse()
    .find(
      (trace) =>
        trace.toolName === "check_availability" &&
        trace.result?.success === true &&
        Array.isArray(trace.result?.availableSlots)
    );

  const slots =
    availabilityResult?.result?.availableSlots?.map(
      (slot: any) =>
        typeof slot === "string"
          ? slot
          : slot.startTime
    ) ?? [];

  // Find the latest successful booking or rescheduling action.
  const appointmentChange = [...traces]
    .reverse()
    .find(
      (trace) =>
        trace.result?.success === true &&
        [
          "book_appointment",
          "reschedule_appointment",
        ].includes(trace.toolName) &&
        trace.result?.appointment
    );

  // Detect a successful cancellation.
  const cancellationSucceeded = [...traces]
    .reverse()
    .some(
      (trace) =>
        trace.toolName === "cancel_appointment" &&
        trace.result?.success === true
    );

  const savedAppointment =
    appointmentChange?.result?.appointment;

  const appointment = savedAppointment
    ? {
        appointmentId: String(
          savedAppointment.appointmentId ??
            savedAppointment.id ??
            savedAppointment._id ??
            ""
        ),
        doctorName:
          savedAppointment.doctorName ??
          result.appointmentState?.doctorName ??
          "",
        speciality:
          savedAppointment.speciality ??
          result.appointmentState?.speciality ??
          "",
        date:
          savedAppointment.date ??
          result.appointmentState?.date ??
          "",
        startTime:
          savedAppointment.startTime ??
          result.appointmentState?.startTime ??
          "",
        endTime:
          savedAppointment.endTime ??
          result.appointmentState?.endTime ??
          "",
        status: savedAppointment.status ?? "Confirmed",
      }
    : null;

  // Tell the frontend exactly what happened this turn.
  const appointmentAction = cancellationSucceeded
    ? "cancelled"
    : appointmentChange?.toolName === "reschedule_appointment"
      ? "rescheduled"
      : appointmentChange?.toolName === "book_appointment"
        ? "booked"
        : "unchanged";

  return {
    message: result.text,
    doctors: doctors ?? [],
    slots,
    appointmentAction,
    appointment:
      appointmentAction === "cancelled" ? null : appointment,
    patient: {
      id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
    },
    sessionId,
    appointmentState: result.appointmentState,
    toolTrace: traces,
  };
}


function getIndiaDateInfo() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    currentDate: `${values.year}-${values.month}-${values.day}`,
    currentDay: values.weekday,
    currentDateTime: new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "long",
    }).format(now),
  };
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const message = body.message;
    const sessionId = body.sessionId;
    const patientEmail =
      body.patientEmail || "abhishek@example.com";

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        { message: "Please provide a valid message." },
        { status: 400 }
      );
    }

    if (
      typeof sessionId !== "string" ||
      !sessionId.trim()
    ) {
      return NextResponse.json(
        { message: "A valid sessionId is required." },
        { status: 400 }
      );
    }

    const patient = await findPatientByEmail(patientEmail);

    if (!patient) {
      return NextResponse.json(
        { message: "Patient account was not found." },
        { status: 404 }
      );
    }

    // Load the conversation belonging to this session.
    let conversation =
      await findConversationBySessionId(sessionId);

    // Prevent one patient's session from being reused by another.
    if (
      conversation?.patientId &&
      conversation.patientId.toString() !==
        patient._id.toString()
    ) {
      return NextResponse.json(
        {
          message:
            "This session does not belong to this patient.",
        },
        { status: 403 }
      );
    }

    const previousMessages = conversation?.messages ?? [];
    const previousState =
      conversation?.appointmentState ?? {};

    // Build the conversation history for the agent.
    const messages = [
      ...previousMessages.map((item) => ({
        role: item.role as "user" | "assistant",
        content: item.content,
      })),
      {
        role: "user" as const,
        content: message.trim(),
      },
    ];

    const dateInfo = getIndiaDateInfo();

    const result = await runAgent({
      messages,
      patientId: patient._id.toString(),
      appointmentState: previousState,
      ...dateInfo,
    });

    // Persist the user message, assistant response, and updated state.
    const now = new Date();

    const updatedMessages = [
      ...previousMessages.map((item) => ({
        role: item.role as "user" | "assistant",
        content: item.content,
        createdAt: item.createdAt ?? now,
      })),
      {
        role: "user" as const,
        content: message.trim(),
        createdAt: now,
      },
      {
        role: "assistant" as const,
        content: result.text,
        createdAt: new Date(),
      },
    ];

    conversation = await updateConversation(sessionId, {
      patientId: patient._id.toString(),
      messages: updatedMessages,
      appointmentState: result.appointmentState,
    });

    const response = getStructuredResponse(
      result,
      patient,
      sessionId
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while connecting to the scheduling assistant.",
      },
      { status: 500 }
    );
  }
}
