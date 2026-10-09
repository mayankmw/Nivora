import type { LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Stand-in for a module that is not built yet. */
export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={`${title} is not built yet`}
        description="This module arrives in a later milestone."
      />
    </div>
  );
}
