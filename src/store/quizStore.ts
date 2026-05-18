import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Question {
  id: string;
  number: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  language: string;
  hasWarning: boolean;
}

type AnswerMap = Record<string, string>; // questionId → 'A'|'B'|'C'|'D'

interface QuizStore {
  // State
  paperSetId: string | null;
  paperSetTitle: string;
  questions: Question[];
  answers: AnswerMap;
  currentIndex: number;
  timeElapsed: number; // seconds
  isSubmitted: boolean;
  sessionId: string | null;

  // Actions
  initQuiz: (paperSetId: string, title: string, questions: Question[]) => void;
  selectAnswer: (questionId: string, option: string) => void;
  navigate: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      paperSetId: null,
      paperSetTitle: "",
      questions: [],
      answers: {},
      currentIndex: 0,
      timeElapsed: 0,
      isSubmitted: false,
      sessionId: null,

      initQuiz: (paperSetId, title, questions) =>
        set({
          paperSetId,
          paperSetTitle: title,
          questions,
          answers: {},
          currentIndex: 0,
          timeElapsed: 0,
          isSubmitted: false,
          sessionId: null,
        }),

      selectAnswer: (questionId, option) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: option },
        })),

      navigate: (index) =>
        set((state) => ({
          currentIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
        })),

      nextQuestion: () =>
        set((state) => ({
          currentIndex: Math.min(
            state.currentIndex + 1,
            state.questions.length - 1
          ),
        })),

      prevQuestion: () =>
        set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0),
        })),

      tickTimer: () =>
        set((state) => ({ timeElapsed: state.timeElapsed + 1 })),

      submitQuiz: async () => {
        const { paperSetId, answers, timeElapsed } = get();
        if (!paperSetId) return;

        const res = await fetch("/api/quiz/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paperSetId, answers, timeTaken: timeElapsed }),
        });

        if (res.ok) {
          const data = await res.json();
          set({ isSubmitted: true, sessionId: data.sessionId });
        }
      },

      resetQuiz: () =>
        set({
          paperSetId: null,
          paperSetTitle: "",
          questions: [],
          answers: {},
          currentIndex: 0,
          timeElapsed: 0,
          isSubmitted: false,
          sessionId: null,
        }),
    }),
    {
      name: "loksewa-quiz-state",
      partialize: (state) => ({
        paperSetId: state.paperSetId,
        answers: state.answers,
        currentIndex: state.currentIndex,
        timeElapsed: state.timeElapsed,
      }),
    }
  )
);
