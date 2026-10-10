
import { NextResponse } from "next/server";

import { connectDB } from "@/db/mongodb";
import { findPatientByEmail } from "@/db/repositories/patientRepository";
import { runEvaluation } from "@/evaluation/evaluator";
import { calculateMetrics } from "@/evaluation/metrics";

function getIndiaDateInfo() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).formatToParts(now);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    currentDate: `${values.year}-${values.month}-${values.day}`,
    currentDay: values.weekday,
    currentDateTime: new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "long",
    }).format(now),
  };
}

export async function POST() {
  try {
    await connectDB();

    const patientEmail =
      process.env.EVALUATION_PATIENT_EMAIL;

    if (!patientEmail) {
      return NextResponse.json(
        {
          message:
            "Set EVALUATION_PATIENT_EMAIL to a seeded test patient.",
        },
        { status: 500 }
      );
    }

    const patient = await findPatientByEmail(patientEmail);

    if (!patient) {
      return NextResponse.json(
        { message: "Evaluation patient was not found." },
        { status: 404 }
      );
    }

    const results = await runEvaluation({
      patientId: patient._id.toString(),
      ...getIndiaDateInfo(),
    });

    const metrics = calculateMetrics(results);

    return NextResponse.json({
      metrics,
      results,
    });
  } catch (error) {
    console.error("Evaluation error:", error);

    return NextResponse.json(
      { message: "Evaluation run failed." },
      { status: 500 }
    );
  }
}