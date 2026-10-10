# Patient Appointment Scheduling Agent

A multi-turn AI appointment scheduling agent built with Next.js, TypeScript, Gemini, and MongoDB. It helps patients find doctors, check availability, and book, cancel, or reschedule appointments.

## Prerequisites

* Node.js and npm
* MongoDB Atlas account or a running MongoDB instance
* Gemini API key

## Setup

1. Clone the repository and open the project directory.

   ```bash
   git clone https://github.com/Abhishek-3191/Patient-Scheduling-Assistant.git
   cd Patient-Scheduling-Assistant
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root.

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string
   
   EVALUATION_PATIENT_EMAIL=evaluation@example.com
   EVALUATION_PATIENT_ID=6ac6b4031e0b85a12c8d02be
   ```
   For email and id you can run  
   ```bash
   npm run seed
   ```
   Replace the API key and MongoDB connection string with your own values. Ensure the evaluation patient ID exists in your database and corresponds to the intended test patient. Never commit your `.env` file.

## Run the Application

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

To create a production build:

```bash
npm run build
npm run start
```

## Run the Evaluation Suite

Run the predefined evaluation scenarios:

```bash
npm run evaluate
```

The evaluation runner connects to MongoDB and executes scenarios covering doctor discovery, doctor selection, ambiguous requests, missing details, booking confirmation, weekend handling, and unavailable appointment slots.

The output includes individual scenario results, assertion details, and the overall pass rate.

**Before running:** ensure the evaluation patient exists and the configured patient ID is correct. Use a dedicated test database or resettable test data when scenarios create or modify appointments.

## Run the Improvement Loop

Run the baseline-versus-improved evaluation:

```bash
npm run evaluate:loop
```

The loop runs the same scenarios with the missing-details guardrail disabled and enabled, calculates both pass rates, and reports resolved failures, new failures, and regression status.

A higher score is not automatically proof of improvement. Review the failed assertions and verify that booking-related scenarios check actual tool execution and database side effects, not just response wording.

## Design Note

See [`DESIGN.md`](./DESIGN.md) for the architecture decisions, evaluation methodology, measured results, production considerations, and the role of AI versus engineering judgment.
