import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
          AI Patient Scheduling Assistant
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Book your doctor appointment through a simple conversation.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
          Find doctors, check available appointment slots, and securely book
          your appointment with our AI scheduling assistant.
        </p>

        <Link
          href="/chat"
          className="mt-8 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Start Scheduling
        </Link>
      </section>
    </main>
  );
}