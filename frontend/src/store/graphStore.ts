import { create } from "zustand";

type GraphState = {
  pendingExpression: string | null;
  sendToGraph: (expression: string) => void;
  clearPending: () => void;
};

export const useGraphStore = create<GraphState>((set) => ({
  pendingExpression: null,
  sendToGraph: (expression) => set({ pendingExpression: expression }),
  clearPending: () => set({ pendingExpression: null }),
}));
