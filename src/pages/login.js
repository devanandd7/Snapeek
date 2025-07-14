import Navbar, { Footer } from '../components/Navbar';
import LoginForm from '../components/auth/LoginForm';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin({ email, password }) {
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(data.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold mb-2 text-blue-700 text-center">Welcome Back!</h1>
          <p className="text-gray-500 dark:text-gray-300 mb-6 text-center text-base">Login to your Snapeek account to manage your screenshots and AI insights.</p>
          <LoginForm onSubmit={handleLogin} error={error} />
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-semibold">Sign up</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
