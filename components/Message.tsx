type MessageProps = {
  role: "user" | "assistant";
  content: string;
};

export default function Message({ role, content }: MessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] items-end gap-3 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isUser && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white shadow-sm">
            AI
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-3 text-[14px] leading-6 shadow-sm ${
            isUser
              ? "rounded-br-md bg-zinc-900 text-white"
              : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}