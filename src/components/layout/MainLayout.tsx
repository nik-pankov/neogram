"use client";

import { useAppStore } from "@/store/app.store";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { useEffect } from "react";

export function MainLayout() {
  const { selectedChatId, showSidebar, setShowSidebar } = useAppStore();

  // On mobile: auto-hide sidebar when chat is selected
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setShowSidebar]);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--tg-bg)" }}>
      {/* Sidebar */}
      <div
        className={`
          flex-shrink-0 h-full
          md:w-[360px] lg:w-[380px]
          ${showSidebar ? "w-full" : "w-0 hidden"}
          ${selectedChatId ? "md:flex hidden" : "flex"}
          md:flex
          border-r
        `}
        style={{ borderColor: "var(--tg-border)" }}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        className={`
          flex-1 h-full overflow-hidden
          ${selectedChatId ? "flex" : "hidden md:flex"}
        `}
      >
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
}
