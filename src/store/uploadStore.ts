import { create } from "zustand";

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

interface UploadStore {
  status: UploadStatus;
  jobId: string | null;
  progress: number; // 0-100
  errorMessage: string | null;
  paperSetId: string | null;
  warnings: string[];
  totalQuestions: number;
  ocrConfidence: number;

  setStatus: (status: UploadStatus) => void;
  setJobId: (jobId: string) => void;
  setProgress: (progress: number) => void;
  setError: (message: string) => void;
  setResult: (data: {
    paperSetId: string;
    warnings: string[];
    totalQuestions: number;
    ocrConfidence: number;
  }) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  status: "idle",
  jobId: null,
  progress: 0,
  errorMessage: null,
  paperSetId: null,
  warnings: [],
  totalQuestions: 0,
  ocrConfidence: 0,

  setStatus: (status) => set({ status }),
  setJobId: (jobId) => set({ jobId }),
  setProgress: (progress) => set({ progress }),
  setError: (message) => set({ status: "error", errorMessage: message }),
  setResult: ({ paperSetId, warnings, totalQuestions, ocrConfidence }) =>
    set({ status: "done", paperSetId, warnings, totalQuestions, ocrConfidence }),
  reset: () =>
    set({
      status: "idle",
      jobId: null,
      progress: 0,
      errorMessage: null,
      paperSetId: null,
      warnings: [],
      totalQuestions: 0,
      ocrConfidence: 0,
    }),
}));
