"use client";

import { useState } from "react";
import { Search, Menu, X, Edit, Settings, Users, Bookmark, HelpCircle, Moon, LogOut } from "lucide-react";
import { useAppStore } from "@/store/app.store";
import { useUser } from "@/hooks/useUser";
import { UserAvatar } from "@/components/ui/ChatAvatar";

export function SidebarHeader({ onNewChat }: { onNewChat?: () => void }) {
  const { searchQuery, setSearchQuery, currentUser } = useAppStore();
  const { signOut } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const menuItems = [
    { icon: Users, label: "New Group", action: () => setMenuOpen(false) },
    { icon: Bookmark, label: "Saved Messages", action: () => setMenuOpen(false) },
    { icon: Settings, label: "Settings", action: () => setMenuOpen(false) },
    { icon: Moon, label: "Night Mode", action: () => setMenuOpen(false) },
    { icon: HelpCircle, label: "Help", action: () => setMenuOpen(false) },
    {
      icon: LogOut, label: "Sign Out", danger: true,
      action: async () => { setMenuOpen(false); await signOut(); }
    },
  ];

  return (
    <div className="flex-shrink-0">
      <div className="flex items-center gap-2 px-3 py-2 h-14">
        {isSearchFocused || searchQuery ? (
          <button
            onClick={() => { setSearchQuery(""); setIsSearchFocused(false); }}
            className="p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ color: "var(--tg-accent)" }}
          >
            <X size={20} />
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full transition-colors hover:bg-white/10 overflow-hidden flex items-center justify-center"
            >
              {currentUser ? (
                <UserAvatar user={currentUser} size="sm" />
              ) : (
                <div className="p-2" style={{ color: "var(--tg-text-secondary)" }}>
                  <Menu size={20} />
                </div>
              )}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute left-0 top-11 w-60 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
                  style={{ background: "#243447", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {/* User info at top */}
                  {currentUser && (
                    <div className="flex items-center gap-3 px-4 py-3 mb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <UserAvatar user={currentUser} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: "var(--tg-text)" }}>
                          {currentUser.full_name ?? "User"}
                        </div>
                        <div className="text-xs truncate" style={{ color: "var(--tg-text-secondary)" }}>
                          {currentUser.username ? `@${currentUser.username}` : "No username"}
                        </div>
                      </div>
                    </div>
                  )}
                  {menuItems.map(({ icon: Icon, label, danger, action }) => (
                    <button
                      key={label}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{ color: danger ? "#ef4444" : "var(--tg-text)" }}
                      onClick={action}
                    >
                      <Icon size={17} style={{ color: danger ? "#ef4444" : "var(--tg-text-secondary)" }} />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Search input */}
        <div
          className="flex-1 flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors"
          style={{ background: "var(--tg-input)" }}
        >
          <Search size={15} style={{ color: "var(--tg-text-secondary)" }} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => !searchQuery && setIsSearchFocused(false)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--tg-text)" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={13} style={{ color: "var(--tg-text-secondary)" }} />
            </button>
          )}
        </div>

        {!isSearchFocused && !searchQuery && (
          <button
            onClick={onNewChat}
            className="p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ color: "var(--tg-accent)" }}
          >
            <Edit size={19} />
          </button>
        )}
      </div>
    </div>
  );
}
