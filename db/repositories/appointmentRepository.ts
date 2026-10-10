import { Appointment } from "../models/Appointment";

export async function findBookedAppointments(
  doctorId: string,
  date: string
) {
  return Appointment.find({
    doctorId,
    date,
    status: "BOOKED",
  })
    .select("_id date startTime endTime patientId")
    .lean();
}

export async function findAppointmentById(appointmentId: string) {
  return Appointment.findById(appointmentId).lean();
}

export async function findPatientAppointments(patientId: string) {
  return Appointment.find({
    patientId,
    status: "BOOKED",
  })
    .sort({ date: 1, startTime: 1 })
    .lean();
}

export async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  speciality: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  return Appointment.create({
    ...data,
    status: "BOOKED",
  });
}

export async function cancelAppointment(appointmentId: string) {
  return Appointment.findByIdAndUpdate(
    appointmentId,
    {
      status: "CANCELLED",
    },
    { new: true }
  ).lean();
}