import { QueryClient } from '@tanstack/react-query';

// Server state lives in TanStack Query; Zustand is only for session and UI state.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
