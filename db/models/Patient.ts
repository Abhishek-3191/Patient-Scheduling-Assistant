import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
  name: string;
  email: string;
  phone: string;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Patient: Model<IPatient> =
  mongoose.models.Patient ||
  mongoose.model<IPatient>("Patient", PatientSchema);