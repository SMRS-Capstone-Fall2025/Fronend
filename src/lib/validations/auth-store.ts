import { create } from "zustand";
import type { AccountDto } from "@/services/types";

export type AuthAccountStore = {
  readonly account: AccountDto | null;
  setAccount: (account: AccountDto | null) => void;
  clear: () => void;
};

export const useAuthAccountStore = create<AuthAccountStore>((set) => ({
  account: null,
  setAccount: (account) => set({ account }),
  clear: () => set({ account: null }),
}));

