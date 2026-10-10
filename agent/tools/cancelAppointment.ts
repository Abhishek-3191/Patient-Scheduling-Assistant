import {
  findAppointmentById,
  cancelAppointment as cancelAppointmentRepository,
} from "@/db/repositories/appointmentRepository";

type CancelAppointmentInput = {
  appointmentId: string;
  patientId: string;
};

export async function cancelAppointmentTool(
  input: CancelAppointmentInput
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
        "You are not authorized to cancel this appointment.",
    };
  }

  if (appointment.status === "CANCELLED") {
    return {
      success: false,
      error: "This appointment is already cancelled.",
    };
  }

  const cancelled =
    await cancelAppointmentRepository(
      input.appointmentId
    );

  return {
    success: true,
    appointment: cancelled,
  };
}