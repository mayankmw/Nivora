import { LayoutDashboard } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Occupancy, fees and daily activity at a glance." />
      <EmptyState
        icon={LayoutDashboard}
        title="No data yet"
        description="Dashboard tiles appear here as each module is built."
      />
    </div>
  );
}
