import { Suspense } from 'react';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { Loader2 } from 'lucide-react';

function DashboardLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-20 pt-12 sm:px-12">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-electric)]" />
        <p className="text-white/70">Loading dashboard...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
