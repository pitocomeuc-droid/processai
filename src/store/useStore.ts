import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Company, ChatMessage, OnboardingAnswer } from '@/types'

interface AppState {
  user: User | null
  company: Company | null
  messages: ChatMessage[]
  onboardingAnswers: OnboardingAnswer[]
  onboardingStep: number
  isOnboardingComplete: boolean

  setUser: (user: User | null) => void
  setCompany: (company: Company | null) => void
  addMessage: (msg: ChatMessage) => void
  setMessages: (msgs: ChatMessage[]) => void
  setOnboardingAnswers: (answers: OnboardingAnswer[]) => void
  setOnboardingStep: (step: number) => void
  setOnboardingComplete: (done: boolean) => void
  reset: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      messages: [],
      onboardingAnswers: [],
      onboardingStep: 0,
      isOnboardingComplete: false,

      setUser: (user) => set({ user }),
      setCompany: (company) => set({ company }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      setMessages: (msgs) => set({ messages: msgs }),
      setOnboardingAnswers: (answers) => set({ onboardingAnswers: answers }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setOnboardingComplete: (done) => set({ isOnboardingComplete: done }),
      reset: () => set({
        user: null, company: null, messages: [],
        onboardingAnswers: [], onboardingStep: 0, isOnboardingComplete: false,
      }),
    }),
    { name: 'processai-storage' }
  )
)
