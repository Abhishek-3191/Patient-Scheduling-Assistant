import Chat from "@/components/Chat";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-[73px] max-w-3xl items-center justify-between px-4">
          <div>
            <h1 className="text-base font-semibold text-zinc-900">
              Patient Scheduling Assistant
            </h1>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-zinc-500">
                Available to help
              </span>
            </div>
          </div>

          <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500">
            AI Assistant
          </div>
        </div>
      </header>

      <Chat />
    </main>
  );
}