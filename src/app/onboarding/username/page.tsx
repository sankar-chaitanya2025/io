import { Suspense } from 'react';
import { UsernameContent } from '@/components/onboarding/username-content';
import { Loader } from 'lucide-react';

function UsernameLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-20 pt-12 sm:px-12">
      <div className="flex flex-col items-center gap-4">
        <Loader className="h-8 w-8 animate-spin text-[var(--accent-electric)]" />
        <p className="text-white/70">Loading...</p>
      </div>
    </div>
  );
}

export default function UsernamePage() {
  return (
    <Suspense fallback={<UsernameLoading />}>
      <UsernameContent />
    </Suspense>
  );
}
