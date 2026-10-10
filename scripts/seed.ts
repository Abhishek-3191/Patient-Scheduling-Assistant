import "dotenv/config";

import { connectDB } from "../db/mongodb";
import { Doctor } from "../db/models/Doctor";
import { Patient } from "../db/models/Patient";
import { Appointment } from "../db/models/Appointment";

async function seed() {
  await connectDB();

  console.log("Connected to MongoDB");

  // Clear old seed data
  await Appointment.deleteMany({});
  await Patient.deleteMany({});
  await Doctor.deleteMany({});

  // --------------------------------------------------
  // DOCTORS
  // --------------------------------------------------

  const doctors = await Doctor.insertMany([
  // --------------------------------------------------
  // DERMATOLOGY
  // --------------------------------------------------

  {
    name: "Dr. Rahul Sharma",
    speciality: "Dermatology",
    experience: 12,
    focusAreas: [
      "hair and scalp",
      "hair loss",
      "skin",
      "acne",
      "nails",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  {
    name: "Dr. Ananya Kapoor",
    speciality: "Dermatology",
    experience: 9,
    focusAreas: [
      "skin",
      "acne",
      "eczema",
      "hair and scalp",
      "nails",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  // --------------------------------------------------
  // CARDIOLOGY
  // --------------------------------------------------

  {
    name: "Dr. Ankit Sharma",
    speciality: "Cardiology",
    experience: 15,
    focusAreas: [
      "heart",
      "chest discomfort",
      "blood pressure",
      "cholesterol",
      "heart rhythm",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  {
    name: "Dr. Priya Mehta",
    speciality: "Cardiology",
    experience: 10,
    focusAreas: [
      "heart",
      "blood pressure",
      "heart rhythm",
      "preventive cardiology",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  // --------------------------------------------------
  // GENERAL MEDICINE
  // --------------------------------------------------

  {
    name: "Dr. Amit Verma",
    speciality: "General Medicine",
    experience: 8,
    focusAreas: [
      "fever",
      "cold",
      "cough",
      "fatigue",
      "general health",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  {
    name: "Dr. Amit Sharma",
    speciality: "General Medicine",
    experience: 11,
    focusAreas: [
      "fever",
      "infection",
      "headache",
      "fatigue",
      "general health",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  // --------------------------------------------------
  // PEDIATRICS
  // --------------------------------------------------

  {
    name: "Dr. Neha Singh",
    speciality: "Pediatrics",
    experience: 9,
    focusAreas: [
      "children",
      "fever",
      "child development",
      "vaccination",
      "common childhood illness",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  {
    name: "Dr. Neha Kapoor",
    speciality: "Pediatrics",
    experience: 7,
    focusAreas: [
      "children",
      "newborns",
      "vaccination",
      "child development",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  // --------------------------------------------------
  // ORTHOPEDICS
  // --------------------------------------------------

  {
    name: "Dr. Arjun Kapoor",
    speciality: "Orthopedics",
    experience: 14,
    focusAreas: [
      "bones",
      "joints",
      "back pain",
      "knee pain",
      "sports injuries",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  {
    name: "Dr. Rohan Kapoor",
    speciality: "Orthopedics",
    experience: 10,
    focusAreas: [
      "joints",
      "shoulder pain",
      "knee pain",
      "fractures",
      "sports injuries",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  // --------------------------------------------------
  // GYNECOLOGY
  // --------------------------------------------------

  {
    name: "Dr. Sneha Rao",
    speciality: "Gynecology",
    experience: 11,
    focusAreas: [
      "women's health",
      "menstrual health",
      "pregnancy",
      "prenatal care",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  {
    name: "Dr. Sneha Sharma",
    speciality: "Gynecology",
    experience: 8,
    focusAreas: [
      "women's health",
      "menstrual health",
      "pregnancy",
      "hormonal health",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  // --------------------------------------------------
  // ENT
  // --------------------------------------------------

  {
    name: "Dr. Vikram Iyer",
    speciality: "ENT",
    experience: 13,
    focusAreas: [
      "ear",
      "nose",
      "throat",
      "sinus",
      "hearing",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },

  {
    name: "Dr. Karan Iyer",
    speciality: "ENT",
    experience: 9,
    focusAreas: [
      "ear",
      "sinus",
      "throat",
      "hearing",
      "voice",
    ],
    workingDays: [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    workingHours: {
      start: "10:00",
      end: "20:00",
    },
  },
]);

  console.log(`Created ${doctors.length} doctors`);

  // --------------------------------------------------
  // PATIENTS
  // --------------------------------------------------

  const patients = await Patient.insertMany([
  {
    name: "Abhishek Srivastava",
    email: "abhishek@example.com",
    phone: "+91 9876543210",
  },
  {
    name: "Rahul Kumar",
    email: "rahul@example.com",
    phone: "+91 9876543211",
  },
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 9876543212",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 9876543213",
  },
  {
    name: "Priya Mehta",
    email: "priya.mehta@example.com",
    phone: "+91 9876543214",
  },
  {
    name: "Aman Gupta",
    email: "aman@example.com",
    phone: "+91 9876543215",
  },
  {
    name: "Sneha Patel",
    email: "sneha@example.com",
    phone: "+91 9876543216",
  },
  {
    name: "Neha Singh",
    email: "neha@example.com",
    phone: "+91 9876543217",
  },
]);

console.log(`Created ${patients.length} patients`);

  console.log(`Created ${patients.length} patients`);

  // --------------------------------------------------
  // EXISTING APPOINTMENTS
  // --------------------------------------------------

const appointments = [
  // Rahul Sharma - Dermatology
  {
    doctor: doctors[0],
    patient: patients[1],
    date: "2026-10-12",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    doctor: doctors[0],
    patient: patients[2],
    date: "2026-10-12",
    startTime: "14:00",
    endTime: "15:00",
  },
  {
    doctor: doctors[0],
    patient: patients[3],
    date: "2026-10-13",
    startTime: "17:00",
    endTime: "18:00",
  },

  // Ananya Kapoor - Dermatology
  {
    doctor: doctors[1],
    patient: patients[4],
    date: "2026-10-12",
    startTime: "11:00",
    endTime: "12:00",
  },

  // Ankit Sharma - Cardiology
  {
    doctor: doctors[2],
    patient: patients[5],
    date: "2026-10-12",
    startTime: "14:00",
    endTime: "15:00",
  },
  {
    doctor: doctors[2],
    patient: patients[6],
    date: "2026-10-13",
    startTime: "16:00",
    endTime: "17:00",
  },

  // Priya Mehta - Cardiology
  {
    doctor: doctors[3],
    patient: patients[1],
    date: "2026-10-14",
    startTime: "10:00",
    endTime: "11:00",
  },

  // Amit Verma - General Medicine
  {
    doctor: doctors[4],
    patient: patients[2],
    date: "2026-10-13",
    startTime: "12:00",
    endTime: "13:00",
  },

  // Amit Sharma - General Medicine
  {
    doctor: doctors[5],
    patient: patients[3],
    date: "2026-10-15",
    startTime: "15:00",
    endTime: "16:00",
  },

  // Neha Singh - Pediatrics
  {
    doctor: doctors[6],
    patient: patients[4],
    date: "2026-10-14",
    startTime: "13:00",
    endTime: "14:00",
  },

  // Neha Kapoor - Pediatrics
  {
    doctor: doctors[7],
    patient: patients[5],
    date: "2026-10-16",
    startTime: "11:00",
    endTime: "12:00",
  },

  // Arjun Kapoor - Orthopedics
  {
    doctor: doctors[8],
    patient: patients[6],
    date: "2026-10-15",
    startTime: "17:00",
    endTime: "18:00",
  },

  // Rohan Kapoor - Orthopedics
  {
    doctor: doctors[9],
    patient: patients[7],
    date: "2026-10-12",
    startTime: "10:00",
    endTime: "11:00",
  },

  // Sneha Rao - Gynecology
  {
    doctor: doctors[10],
    patient: patients[1],
    date: "2026-10-16",
    startTime: "12:00",
    endTime: "13:00",
  },

  // Sneha Sharma - Gynecology
  {
    doctor: doctors[11],
    patient: patients[2],
    date: "2026-10-13",
    startTime: "18:00",
    endTime: "19:00",
  },

  // Vikram Iyer - ENT
  {
    doctor: doctors[12],
    patient: patients[3],
    date: "2026-10-14",
    startTime: "15:00",
    endTime: "16:00",
  },

  // Karan Iyer - ENT
  {
    doctor: doctors[13],
    patient: patients[4],
    date: "2026-10-15",
    startTime: "11:00",
    endTime: "12:00",
  },
];

  await Appointment.insertMany(
    appointments.map((appointment) => ({
      patientId: appointment.patient._id,
      doctorId: appointment.doctor._id,

      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      speciality: appointment.doctor.speciality,

      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,

      status: "BOOKED",
    }))
  );

  console.log(`Created ${appointments.length} appointments`);

  console.log("Database seeded successfully!");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});