import { create } from 'zustand';

interface FilterState {
  categories: string[];
  price: string | null;
  sort: string;
  setFilters: (filters: {
    categories: string[];
    price: string | null;
    sort: string;
  }) => void;
  clearFilters: () => void;
}

const initialState = {
  categories: [],
  price: null,
  sort: 'recommended',
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setFilters: (filters) => set(filters),
  clearFilters: () => set(initialState),
}));
