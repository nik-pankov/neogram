"use client";

import { useState } from "react";
import { Search, Menu, X, Edit, Settings, Users, Bookmark, HelpCircle, Moon } from "lucide-react";
import { useAppStore } from "@/store/app.store";

export function SidebarHeader() {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="flex-shrink-0">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 h-14">
        {isSearchFocused || searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery("");
              setIsSearchFocused(false);
            }}
            className="p-2 rounded-full transition-colors hover:bg-white/10 text-[color:var(--tg-accent)]"
          >
            <X size={20} />
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full transition-colors hover:bg-white/10"
              style={{ color: "var(--tg-text-secondary)" }}
            >
              <Menu size={20} />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute left-0 top-10 w-56 rounded-lg shadow-xl z-50 py-1 overflow-hidden"
                  style={{ background: "#243447" }}
                >
                  {[
                    { icon: Users, label: "New Group" },
                    { icon: Bookmark, label: "Saved Messages" },
                    { icon: Settings, label: "Settings" },
                    { icon: HelpCircle, label: "Help" },
                    { icon: Moon, label: "Night Mode" },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "var(--tg-text)" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon size={18} style={{ color: "var(--tg-text-secondary)" }} />
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
          <Search size={16} style={{ color: "var(--tg-text-secondary)" }} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => !searchQuery && setIsSearchFocused(false)}
            className="flex-1 bg-transparent text-sm outline-none placeholder-[color:var(--tg-text-secondary)]"
            style={{ color: "var(--tg-text)" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={14} style={{ color: "var(--tg-text-secondary)" }} />
            </button>
          )}
        </div>

        {/* New chat button */}
        {!isSearchFocused && !searchQuery && (
          <button
            className="p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ color: "var(--tg-accent)" }}
          >
            <Edit size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
