import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;

  patientName: string;
  doctorName: string;
  speciality: string;

  date: string;
  startTime: string;
  endTime: string;

  status: "BOOKED" | "CANCELLED";
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    doctorName: {
      type: String,
      required: true,
    },

    speciality: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["BOOKED", "CANCELLED"],
      default: "BOOKED",
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index(
  {
    doctorId: 1,
    date: 1,
    startTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "BOOKED",
    },
  }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);