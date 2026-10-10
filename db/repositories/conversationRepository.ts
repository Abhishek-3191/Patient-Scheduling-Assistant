
import { Conversation } from "../models/Conversation";
import type { AppointmentState } from "@/agent/state";

export async function findConversationBySessionId(
  sessionId: string
) {
  return Conversation.findOne({
    sessionId,
  }).lean();
}

export async function createConversation(data: {
  sessionId: string;
  patientId: string;
}) {
  return Conversation.create({
    sessionId: data.sessionId,
    patientId: data.patientId,
    messages: [],
    appointmentState: {},
  });
}

export async function updateConversation(
  sessionId: string,
  data: {
    patientId: string;
    messages: {
      role: "user" | "assistant";
      content: string;
      createdAt: Date;
    }[];
    appointmentState: AppointmentState;
  }
) {
  return Conversation.findOneAndUpdate(
    { sessionId },
    {
      patientId: data.patientId,
      messages: data.messages,
      appointmentState: data.appointmentState,
    },
    {
      new: true,
      upsert: true,
    }
  ).lean();
}