import { Patient } from "../models/Patient";

export async function findPatientByEmail(email: string) {
  return Patient.findOne({
    email: email.trim().toLowerCase(),
  }).lean();
}

export async function findPatientById(patientId: string) {
  return Patient.findById(patientId).lean();
}

export async function createPatient(data: {
  name: string;
  email: string;
  phone: string;
}) {
  return Patient.create({
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
  });
}