export type AppointmentIntent =
  | "BOOK"
  | "CANCEL"
  | "RESCHEDULE";

export type ConfirmationStatus =
  | "PENDING"
  | "CONFIRMED";

export interface CandidateDoctor {
  id: string;
  name: string;
  speciality: string;
  experience: number;
  focusAreas: string[];
}

export interface AppointmentState {
  intent?: AppointmentIntent;
  speciality?: string;
  candidateDoctors?: CandidateDoctor[];

  doctorId?: string;
  doctorName?: string;

  date?: string;
  startTime?: string;
  endTime?: string;

  confirmationStatus?: ConfirmationStatus;
  appointmentId?: string;
}

