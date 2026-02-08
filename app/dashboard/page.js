'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import Link from 'next/link';

export default function Dashboard() {
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            Welcome back, {session.user.name}!
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            This is your protected dashboard.
          </p>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Account Information
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Name
                </dt>
                <dd className="text-zinc-900 dark:text-white">
                  {session.user.name}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Email
                </dt>
                <dd className="text-zinc-900 dark:text-white">
                  {session.user.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  User ID
                </dt>
                <dd className="text-zinc-900 dark:text-white font-mono text-sm">
                  {session.user.id}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Session Information
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Session ID
                </dt>
                <dd className="text-zinc-900 dark:text-white font-mono text-sm break-all">
                  {session.session?.id || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Session Expires
                </dt>
                <dd className="text-zinc-900 dark:text-white">
                  {session.session?.expiresAt 
                    ? new Date(session.session.expiresAt).toLocaleString()
                    : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Go to Home
            </Link>
            <button
              onClick={() => alert('Profile editing coming soon!')}
              className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => alert('Settings coming soon!')}
              className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
