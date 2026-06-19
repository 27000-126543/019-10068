import { create } from 'zustand';
import type { User } from '@/types';
import { users } from '@/data/mockData';

interface AuthState {
  currentUser: User | null;
  roleSwitcherOpen: boolean;
  setUser: (id: string) => void;
  toggleRoleSwitcher: () => void;
}

const defaultUser = users.find((u) => u.role === 'senior_analyst') || null;

const useAuthStore = create<AuthState>((set) => ({
  currentUser: defaultUser,
  roleSwitcherOpen: false,
  setUser: (id: string) => {
    const user = users.find((u) => u.id === id) || null;
    set({ currentUser: user });
  },
  toggleRoleSwitcher: () => {
    set((state) => ({ roleSwitcherOpen: !state.roleSwitcherOpen }));
  },
}));

export default useAuthStore;
