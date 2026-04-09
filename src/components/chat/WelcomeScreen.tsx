"use client";

export function WelcomeScreen() {
  return (
    <div
      className="flex-1 h-full flex flex-col items-center justify-center gap-4"
      style={{ background: "var(--tg-chat-bg)" }}
    >
      {/* Telegram-like chat pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg"
          style={{ background: "var(--tg-message-out)" }}
        >
          💬
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--tg-text)" }}>
            NeoGram
          </h2>
          <p className="text-sm max-w-xs" style={{ color: "var(--tg-text-secondary)" }}>
            Select a chat to start messaging. Your messages are fast and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
