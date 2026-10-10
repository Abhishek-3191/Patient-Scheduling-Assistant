import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface ICandidateDoctor {
  id: string;
  name: string;
  speciality: string;
  experience: number;
  focusAreas: string[];
}

export interface IAppointmentState {
  intent?: "BOOK" | "CANCEL" | "RESCHEDULE";

  speciality?: string;

  candidateDoctors?: ICandidateDoctor[];

  doctorId?: string;
  doctorName?: string;

  date?: string;
  startTime?: string;
  endTime?: string;

  confirmationStatus?: "PENDING" | "CONFIRMED";

  appointmentId?: string;
}

export interface IConversation extends Document {
  sessionId: string;
  patientId?: mongoose.Types.ObjectId;
  messages: IMessage[];
  appointmentState?: IAppointmentState;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },

    messages: {
      type: [MessageSchema],
      default: [],
    },

    appointmentState: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);