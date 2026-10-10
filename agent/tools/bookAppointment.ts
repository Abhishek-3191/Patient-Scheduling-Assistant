import { canBookAppointment } from "../guardrails";
import { AppointmentState } from "../state";

import {
  getDoctorById,
} from "@/db/repositories/doctorRepository";

import {
  createAppointment,
  findBookedAppointments,
} from "@/db/repositories/appointmentRepository";

import {
  findPatientById,
} from "@/db/repositories/patientRepository";

type BookAppointmentInput = {
  patientId: string;
  state: AppointmentState;
};

export async function bookAppointmentTool(
  input: BookAppointmentInput
) {
  const validation = canBookAppointment(input.state);

  if (!validation.allowed) {
    return {
      success: false,
      error: validation.reason,
    };
  }

  const {
    doctorId,
    date,
    startTime,
    endTime,
  } = input.state;

  const doctor = await getDoctorById(doctorId!);

  if (!doctor) {
    return {
      success: false,
      error: "Doctor not found.",
    };
  }

  const patient = await findPatientById(
    input.patientId
  );

  if (!patient) {
    return {
      success: false,
      error: "Patient not found.",
    };
  }

  const bookedAppointments =
    await findBookedAppointments(
      doctorId!,
      date!
    );

  const alreadyBooked =
    bookedAppointments.some(
      (appointment) =>
        appointment.startTime === startTime
    );

  if (alreadyBooked) {
    return {
      success: false,
      error:
        "This slot is no longer available. Please choose another slot.",
    };
  }

  try {
    const appointment =
      await createAppointment({
        patientId: patient._id.toString(),
        doctorId: doctor._id.toString(),
        patientName: patient.name,
        doctorName: doctor.name,
        speciality: doctor.speciality,
        date: date!,
        startTime: startTime!,
        endTime: endTime!,
      });

    return {
      success: true,
      appointment: {
        id: appointment._id.toString(),
        doctorName: appointment.doctorName,
        speciality: appointment.speciality,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      },
    };
  } catch (error: any) {
    // MongoDB unique index protects against concurrent booking.
    if (error?.code === 11000) {
      return {
        success: false,
        error:
          "This slot was booked by another patient. Please choose another slot.",
      };
    }

    throw error;
  }
}