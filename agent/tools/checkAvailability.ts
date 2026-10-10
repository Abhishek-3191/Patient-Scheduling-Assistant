import { getDoctorById } from "@/db/repositories/doctorRepository";
import { findBookedAppointments } from "@/db/repositories/appointmentRepository";

type CheckAvailabilityInput = {
  doctorId: string;
  date: string;
};

function generateSlots(start: string, end: string) {
  const slots: { startTime: string; endTime: string }[] = [];

  let hour = Number(start.split(":")[0]);
  const endHour = Number(end.split(":")[0]);

  while (hour < endHour) {
    slots.push({
      startTime: `${String(hour).padStart(2, "0")}:00`,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`,
    });

    hour++;
  }

  return slots;
}

export async function checkAvailabilityTool(
  input: CheckAvailabilityInput
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return {
      success: false,
      error: "Date must use YYYY-MM-DD format.",
    };
  }

  const dateObject = new Date(`${input.date}T00:00:00Z`);

  if (
    Number.isNaN(dateObject.getTime()) ||
    dateObject.toISOString().slice(0, 10) !== input.date
  ) {
    return {
      success: false,
      error: "Invalid appointment date.",
    };
  }

  const doctor = await getDoctorById(input.doctorId);

  if (!doctor) {
    return {
      success: false,
      error: "Doctor not found.",
    };
  }

  const day = dateObject
    .toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC",
    })
    .toUpperCase();

  if (!doctor.workingDays.includes(day)) {
    return {
      success: true,
      date: input.date,
      doctorId: String(doctor._id),
      doctor: doctor.name,
      speciality: doctor.speciality,
      availableSlots: [],
      message: `${doctor.name} does not work on ${day}.`,
    };
  }

  const bookedAppointments = await findBookedAppointments(
    input.doctorId,
    input.date
  );

  const allSlots = generateSlots(
    doctor.workingHours.start,
    doctor.workingHours.end
  );

  const bookedTimes = new Set(
    bookedAppointments.map((appointment) => appointment.startTime)
  );

  const availableSlots = allSlots.filter(
    (slot) => !bookedTimes.has(slot.startTime)
  );

  return {
    success: true,
    date: input.date,
    doctorId: String(doctor._id),
    doctor: doctor.name,
    speciality: doctor.speciality,
    availableSlots,
  };
}