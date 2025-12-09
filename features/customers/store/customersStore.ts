import { create } from 'zustand';
import { Customer } from '../types/types';

/**
 * Customers store state interface
 */
interface CustomersState {
    // Selected customer for edit/view
    selectedCustomer: Customer | null;

    // Dialog states
    isAddDialogOpen: boolean;
    isEditDialogOpen: boolean;
    isDeleteDialogOpen: boolean;

    // Filters
    searchQuery: string;
    currentPage: number;
    pageSize: number;

    // Actions
    setSelectedCustomer: (customer: Customer | null) => void;
    setAddDialogOpen: (open: boolean) => void;
    setEditDialogOpen: (open: boolean) => void;
    setDeleteDialogOpen: (open: boolean) => void;
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
    selectedCustomer: null,
    isAddDialogOpen: false,
    isEditDialogOpen: false,
    isDeleteDialogOpen: false,
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,

    // Actions
    setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

    setAddDialogOpen: (open) => set({ isAddDialogOpen: open }),

    setEditDialogOpen: (open) => set({
        isEditDialogOpen: open,
        // Clear selected customer when closing
        selectedCustomer: open ? undefined : null
    }),

    setDeleteDialogOpen: (open) => set({
        isDeleteDialogOpen: open,
        // Clear selected customer when closing
        selectedCustomer: open ? undefined : null
    }),

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
