import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  speciality: string;
  experience: number;

  focusAreas: string[];

  workingDays: string[];

  workingHours: {
    start: string;
    end: string;
  };
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    speciality: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      required: true,
    },

    focusAreas: {
      type: [String],
      default: [],
    },

    workingDays: {
      type: [String],
      required: true,
    },

    workingHours: {
      start: {
        type: String,
        required: true,
      },

      end: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor: Model<IDoctor> =
  mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", DoctorSchema);