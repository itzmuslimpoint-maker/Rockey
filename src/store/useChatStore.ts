import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    type: 'chart';
    chartType: 'line' | 'bar' | 'area';
    data: any[];
    title: string;
    dataKey: string;
  };
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    { role: 'assistant', content: "Hi! I'm your AI growth assistant. I've analyzed your current Instagram metrics. How can I help you optimize your strategy today?" }
  ],
  isLoading: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}));
