import { create } from 'zustand';
import { Customer } from '../types/types';

/**
 * Customers store state interface
 */
interface CustomersState {
    // Filters
    searchQuery: string;
    currentPage: number;
    pageSize: number;

    // Actions
    setSearchQuery: (query: string) => void;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
    resetFilters: () => void;
}

/**
 * Customers store using Zustand
 */
export const useCustomersStore = create<CustomersState>((set) => ({
    // Initial state
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,

    // Actions
    setSearchQuery: (query) => set({
        searchQuery: query,
        currentPage: 1 // Reset to first page on search
    }),

    setCurrentPage: (page) => set({ currentPage: page }),

    setPageSize: (size) => set({
        pageSize: size,
        currentPage: 1 // Reset to first page on size change
    }),

    resetFilters: () => set({
        searchQuery: '',
        currentPage: 1,
        pageSize: 10,
    }),
}));
