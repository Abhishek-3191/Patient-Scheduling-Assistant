import { findDoctors as findDoctorsRepository } from "@/db/repositories/doctorRepository";

export type FindDoctorsInput = {
  speciality?: string;
  doctorName?: string;
};

export async function findDoctorsTool(
  input: FindDoctorsInput
) {
  const doctors = await findDoctorsRepository({
    speciality: input.speciality,
    doctorName: input.doctorName,
  });

  return {
    success: true,
    count: doctors.length,
    ambiguous: doctors.length > 1,
    doctors: doctors.map((doctor) => ({
      id: doctor._id.toString(),
      name: doctor.name,
      speciality: doctor.speciality,
      experience: doctor.experience,
      focusAreas: doctor.focusAreas,
    })),
  };
}