import { AppointmentState } from "./state";

export function hasExplicitBookingConfirmation(
  state: AppointmentState
) {
  return state.confirmationStatus === "CONFIRMED";
}

export function canBookAppointment(
  state: AppointmentState
) {
  if (!state.doctorId) {
    return {
      allowed: false,
      reason: "Doctor has not been selected.",
    };
  }

  if (!state.date) {
    return {
      allowed: false,
      reason: "Appointment date has not been selected.",
    };
  }

  if (!state.startTime) {
    return {
      allowed: false,
      reason: "Appointment time has not been selected.",
    };
  }

  if (!hasExplicitBookingConfirmation(state)) {
    return {
      allowed: false,
      reason:
        "Explicit patient confirmation is required before booking.",
    };
  }

  return {
    allowed: true,
  };
}