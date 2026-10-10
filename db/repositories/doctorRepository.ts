import { Doctor } from "../models/Doctor";

export async function findDoctors(params: {
  speciality?: string;
  doctorName?: string;
}) {
  const { speciality, doctorName } = params;

  const query: Record<string, unknown> = {};

  if (speciality) {
    query.speciality = {
      $regex: speciality.trim(),
      $options: "i",
    };
  }

  if (doctorName) {
    const normalizedName = doctorName
      .replace(/^dr\.?\s*/i, "")
      .trim();

    query.name = {
      $regex: normalizedName,
      $options: "i",
    };
  }

  const doctors = await Doctor.find(query)
    .select("_id name speciality experience focusAreas workingDays workingHours")
    .lean();

  return doctors;
}

export async function getDoctorById(doctorId: string) {
  return Doctor.findById(doctorId)
    .select("_id name speciality experience focusAreas workingDays workingHours")
    .lean();
}