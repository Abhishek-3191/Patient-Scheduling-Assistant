
"use client";

import { FormEvent, useEffect, useState } from "react";
import Message from "./Message";
import DoctorCard from "./DoctorCard";
import SlotSelector from "./SlotSelector";
import AppointmentCard from "./AppointmentCard";


type AppointmentData = {
  appointmentId: string;
  doctorName: string;
  speciality: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
};

type ChatApiResponse = {
  message?: string;
  doctors?: Doctor[];
  slots?: string[];
  appointment?: AppointmentData | null;
  appointmentAction?: "booked" | "rescheduled" | "cancelled" | "unchanged";
  patient?: PatientData;
  sessionId?: string;
};

type PatientData = {
  id: string;
  name: string;
  email: string;
};



type MessageType = {
  role: "user" | "assistant";
  content: string;
};

type Doctor = {
  id: string;
  name: string;
  speciality: string;
  experience?: number;
};



export default function Chat() {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI appointment assistant. I can help you find a doctor, check available times, and book an appointment.",
    },
  ]);
  const [patient, setPatient] = useState<PatientData | null>(null);

  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showDoctorsPanel, setShowDoctorsPanel] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [appointment, setAppointment] =
    useState<AppointmentData | null>(null);

  useEffect(() => {
    const key = "patient-scheduling-session-id";

    let id = localStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }

    setSessionId(id);
  }, []);

  function handleViewDoctors() {
  if (showDoctorsPanel) {
    setShowDoctorsPanel(false);
    return;
  }

  setShowDoctorsPanel(true);

  if (doctors.length === 0) {
    void sendMessage("Show me all doctors.");
  }
}

  
async function sendMessage(text: string) {
  const message = text.trim();

  if (!message || loading || !sessionId) return;

  setInput("");
  setLoading(true);

  setMessages((previous) => [
    ...previous,
    { role: "user", content: message },
  ]);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId,
        patientEmail: "abhishek@example.com",
      }),
    });

    const data: ChatApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "The request could not be completed."
      );
    }

    if (data.patient) {
      setPatient(data.patient);
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        content:
          data.message || "Sorry, I couldn't process that request.",
      },
    ]);

    // Update doctor cards when the API returns doctor data.
    if (Array.isArray(data.doctors)) {
      setDoctors(data.doctors);
    }

    // Update available time slots when returned by the API.
    if (Array.isArray(data.slots)) {
      setSlots(data.slots);
      setSelectedSlot("");
    }

    // Update the appointment card only for a successful action.
    
if (data.appointmentAction === "cancelled") {
  setAppointment(null);
  setDoctors([]);
  setSlots([]);
  setSelectedSlot("");
} else if (
  (data.appointmentAction === "booked" ||
    data.appointmentAction === "rescheduled") &&
  data.appointment?.appointmentId
) {
  setAppointment(data.appointment);
  setDoctors([]);
  setSlots([]);
  setSelectedSlot("");
}


    // For "unchanged" or an undefined action, keep the
    // existing appointment card as it is.
  } catch (error) {
    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong while connecting to the scheduling assistant. Please try again.",
      },
    ]);
  } finally {
    setLoading(false);
  }
}

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    await sendMessage(input);
  }

  function handleDoctorSelect(doctor: Doctor) {
    setDoctors([]);
    void sendMessage(
      `I would like to select ${doctor.name} (${doctor.speciality}).`
    );
  }

  function handleSlotSelect(slot: string) {
    setSelectedSlot(slot);

    // Selecting a slot does NOT book the appointment.
    // The assistant should summarize the details and
    // request explicit confirmation.
    void sendMessage(
      `I would like the ${slot} appointment slot. Please confirm the details before booking.`
    );
  }

  function handleSuggestion(text: string) {
    setInput(text);
  }

  return (
    <div className="flex h-[calc(100vh-73px)] flex-col">
      {/* Conversation */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
          {messages.map((message, index) => (
            <Message
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}

          {/* Doctor selection cards */}
          {showDoctorsPanel && (
  <div className="rounded-xl border border-zinc-200 bg-white p-4">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="font-semibold text-zinc-900">Available doctors</h3>

      <button
        type="button"
        onClick={() => setShowDoctorsPanel(false)}
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        Close
      </button>
    </div>

    {doctors.length > 0 ? (
      <div className="grid gap-3 sm:grid-cols-2">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onSelect={handleDoctorSelect}
          />
        ))}
      </div>
    ) : (
      <p className="text-sm text-zinc-500">
        {loading ? "Loading doctors..." : "No doctors to display yet."}
      </p>
    )}
  </div>
)}

          {/* Available appointment slots */}
          {slots.length > 0 && (
            <SlotSelector
              slots={slots}
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
            />
          )}

          {/* Confirmed appointment */}
          
{appointment && patient && sessionId && (
  <AppointmentCard
    {...appointment}
    patientName={patient.name}
    patientEmail={patient.email}
    patientId={patient.id}
    sessionId={sessionId}
    status={appointment.status ?? "Confirmed"}
  />
)}


          {loading && (
            <div className="flex items-end gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                AI
              </div>

              <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message input */}
      <div className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          {messages.length === 1 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {[
                "I need a dermatologist",
                "Show me doctors",
                "Book an appointment",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
             <div className="mb-3 flex justify-end">
  <button
    type="button"
    onClick={handleViewDoctors}
    disabled={loading || !sessionId}
    className="rounded-full border border-zinc-300 px-3 py-2 text-xs text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
  >
    {showDoctorsPanel ? "Hide doctors" : "View doctors"}
  </button>
</div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white p-2 shadow-sm transition focus-within:border-zinc-500 focus-within:shadow-md"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Tell me what you need..."
              disabled={loading || !sessionId}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading || !sessionId}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Send message"
            >
              ↑
            </button>
          </form>

          <p className="mt-2 text-center text-[11px] text-zinc-400">
            AI-generated responses may require verification.
          </p>
        </div>
      </div>
    </div>
  );
}