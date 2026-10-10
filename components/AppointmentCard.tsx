"use client";

import {
  generateAppointmentPDF,
  type AppointmentPDFData,
} from "@/lib/generateAppointmentPDF";

type AppointmentCardProps = AppointmentPDFData;

export default function AppointmentCard({
  patientName,
  patientEmail,
  patientId,
  sessionId,
  appointmentId,
  doctorName,
  speciality,
  date,
  startTime,
  endTime,
  status,
}: AppointmentCardProps) {
  function downloadPDF() {
    generateAppointmentPDF({
      patientName,
      patientEmail,
      patientId,
      sessionId,
      appointmentId,
      doctorName,
      speciality,
      date,
      startTime,
      endTime,
      status,
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-zinc-900">
  {status === "CANCELLED"
    ? "Appointment cancelled"
    : "Appointment details"}
</h3>

      <p className="mt-3 text-sm">Patient: {patientName}</p>
      <p className="text-sm">Email: {patientEmail}</p>
      <p className="text-sm">Doctor: {doctorName}</p>
      <p className="text-sm">Speciality: {speciality}</p>
      <p className="text-sm">Date: {date}</p>
      <p className="text-sm">
        Time: {startTime} – {endTime}
      </p>
      <p className="mt-2 break-all text-xs text-zinc-500">
        Appointment ID: {appointmentId}
      </p>
      <p className="break-all text-xs text-zinc-500">
        Session ID: {sessionId}
      </p>

      <button
        type="button"
        onClick={downloadPDF}
        className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Download appointment confirmation (PDF)
      </button>
    </div>
  );
}