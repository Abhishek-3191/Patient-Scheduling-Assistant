type Doctor = {
  id: string;
  name: string;
  speciality: string;
  experience?: number;
};

type DoctorCardProps = {
  doctor: Doctor;
  onSelect?: (doctor: Doctor) => void;
};

export default function DoctorCard({
  doctor,
  onSelect,
}: DoctorCardProps) {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-700">
          {doctor.name
            .replace("Dr. ", "")
            .split(" ")
            .map((name) => name[0])
            .slice(0, 2)
            .join("")}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-zinc-900">{doctor.name}</h3>

          <p className="mt-1 text-sm text-zinc-500">
            {doctor.speciality}
          </p>

          {doctor.experience !== undefined && (
            <p className="mt-2 text-xs text-zinc-400">
              {doctor.experience} years experience
            </p>
          )}
        </div>
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(doctor)}
          className="mt-4 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
        >
          Select Doctor
        </button>
      )}
    </div>
  );
}