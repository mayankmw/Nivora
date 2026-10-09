import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useThemeSync } from '@/hooks/use-theme-sync';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: ReactNode }) {
  useThemeSync();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </QueryClientProvider>
  );
}
