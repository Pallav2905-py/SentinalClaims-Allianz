'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to Allianz
          </h1>
          
          {session?.user ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-900">
                <p className="text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                  You are signed in as:
                </p>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {session.user.name}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {session.user.email}
                </p>
              </div>
              
              <div className="flex gap-4">
                <a
                  href="/dashboard"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  Go to Dashboard
                </a>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                You are not signed in.
              </p>
              <div className="flex gap-4">
                <a
                  href="/login"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="px-6 py-2 bg-zinc-600 hover:bg-zinc-700 text-white font-medium rounded-md transition-colors"
                >
                  Sign Up
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
