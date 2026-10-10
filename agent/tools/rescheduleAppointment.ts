import {
  findAppointmentById,
  cancelAppointment,
  createAppointment,
  findBookedAppointments,
} from "@/db/repositories/appointmentRepository";

import { getDoctorById } from "@/db/repositories/doctorRepository";

type RescheduleAppointmentInput = {
  appointmentId: string;
  patientId: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
};

export async function rescheduleAppointmentTool(
  input: RescheduleAppointmentInput
) {
  const appointment =
    await findAppointmentById(
      input.appointmentId
    );

  if (!appointment) {
    return {
      success: false,
      error: "Appointment not found.",
    };
  }

  if (
    appointment.patientId.toString() !==
    input.patientId
  ) {
    return {
      success: false,
      error:
        "You are not authorized to reschedule this appointment.",
    };
  }

  if (appointment.status === "CANCELLED") {
    return {
      success: false,
      error:
        "A cancelled appointment cannot be rescheduled.",
    };
  }

  const doctor = await getDoctorById(
    appointment.doctorId.toString()
  );

  if (!doctor) {
    return {
      success: false,
      error: "Doctor not found.",
    };
  }

  const bookedAppointments =
    await findBookedAppointments(
      appointment.doctorId.toString(),
      input.newDate
    );

  const slotTaken = bookedAppointments.some(
    (item) =>
      item.startTime === input.newStartTime
  );

  if (slotTaken) {
    return {
      success: false,
      error:
        "The requested new slot is unavailable.",
    };
  }

  await cancelAppointment(
    input.appointmentId
  );

  const newAppointment =
    await createAppointment({
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      speciality: appointment.speciality,
      date: input.newDate,
      startTime: input.newStartTime,
      endTime: input.newEndTime,
    });

  return {
  success: true,
  previousAppointmentId: appointment._id.toString(),
  appointment: {
    appointmentId: newAppointment._id.toString(),
    doctorName: newAppointment.doctorName,
    speciality: newAppointment.speciality,
    date: newAppointment.date,
    startTime: newAppointment.startTime,
    endTime: newAppointment.endTime,
    status: newAppointment.status,
  },
};
}