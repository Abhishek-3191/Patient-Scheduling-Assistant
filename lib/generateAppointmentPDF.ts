import { jsPDF } from "jspdf";

export type AppointmentPDFData = {
  patientName: string;
  patientEmail: string;
  patientId: string;
  sessionId: string;
  appointmentId: string;
  doctorName: string;
  speciality: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
};

export function generateAppointmentPDF(
  data: AppointmentPDFData
) {
  const pdf = new jsPDF();

  pdf.setFontSize(20);
  pdf.text("Appointment Confirmation", 20, 25);

  pdf.setFontSize(12);
  pdf.text("Patient Details", 20, 42);

  pdf.setFontSize(10);
  pdf.text(`Patient Name: ${data.patientName}`, 20, 52);
  pdf.text(`Email: ${data.patientEmail}`, 20, 61);
  pdf.text(`Patient ID: ${data.patientId}`, 20, 70);
  pdf.text(`Session ID: ${data.sessionId}`, 20, 79);

  pdf.setFontSize(12);
  pdf.text("Appointment Details", 20, 98);

  pdf.setFontSize(10);
  pdf.text(`Appointment ID: ${data.appointmentId}`, 20, 108);
  pdf.text(`Doctor: ${data.doctorName}`, 20, 117);
  pdf.text(`Speciality: ${data.speciality}`, 20, 126);
  pdf.text(`Date: ${data.date}`, 20, 135);
  pdf.text(
    `Time: ${data.startTime} - ${data.endTime}`,
    20,
    144
  );
  pdf.text(`Status: ${data.status}`, 20, 153);

  pdf.setFontSize(9);
  pdf.text(
    "Please retain this document for your records.",
    20,
    175
  );

  pdf.save(`appointment-${data.appointmentId}.pdf`);
}