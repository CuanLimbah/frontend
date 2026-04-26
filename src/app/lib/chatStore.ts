import { create } from 'zustand';
import { getApiBaseUrl } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  addMessage: (message: ChatMessage) => void;
  sendMessage: (content: string, token?: string | null) => Promise<any>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  sendMessage: async (content: string, token?: string | null) => {
    // 1. Add user message
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content };
    set((state) => ({ messages: [...state.messages, userMsg], isLoading: true }));

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Call API
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      
      // 2. Add AI message
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: data.reply };
      set((state) => ({ messages: [...state.messages, aiMsg], isLoading: false }));

      // 3. Return action if any (for navigation)
      return data.action;
    } catch (error) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: 'Maaf, terjadi kesalahan saat menghubungi asisten AI.' };
      set((state) => ({ messages: [...state.messages, errorMsg], isLoading: false }));
      return null;
    }
  }
}));
