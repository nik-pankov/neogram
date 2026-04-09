import { create } from 'zustand'
import type { Profile, ChatWithLastMessage, MessageWithSender } from '@/types/database'

interface AppState {
  // Current user
  currentUser: Profile | null
  setCurrentUser: (user: Profile | null) => void

  // Selected chat
  selectedChatId: string | null
  setSelectedChatId: (id: string | null) => void

  // Chats list
  chats: ChatWithLastMessage[]
  setChats: (chats: ChatWithLastMessage[]) => void
  updateChat: (chat: ChatWithLastMessage) => void

  // Messages
  messages: Record<string, MessageWithSender[]>
  setMessages: (chatId: string, messages: MessageWithSender[]) => void
  addMessage: (chatId: string, message: MessageWithSender) => void
  updateMessage: (chatId: string, message: MessageWithSender) => void

  // Active folder
  activeFolderId: string | null
  setActiveFolderId: (id: string | null) => void

  // UI state
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void

  // Reply/forward state
  replyToMessage: MessageWithSender | null
  setReplyToMessage: (msg: MessageWithSender | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  selectedChatId: null,
  setSelectedChatId: (id) => set({ selectedChatId: id }),

  chats: [],
  setChats: (chats) => set({ chats }),
  updateChat: (chat) =>
    set((state) => ({
      chats: state.chats.map((c) => (c.id === chat.id ? { ...c, ...chat } : c)),
    })),

  messages: {},
  setMessages: (chatId, msgs) =>
    set((state) => ({ messages: { ...state.messages, [chatId]: msgs } })),
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),
  updateMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === message.id ? message : m
        ),
      },
    })),

  activeFolderId: null,
  setActiveFolderId: (id) => set({ activeFolderId: id }),

  showSidebar: true,
  setShowSidebar: (show) => set({ showSidebar: show }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  replyToMessage: null,
  setReplyToMessage: (msg) => set({ replyToMessage: msg }),
}))
