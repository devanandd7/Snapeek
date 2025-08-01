
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RegisterForm from '../components/auth/RegisterForm';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleRegister({ username, email, password }) {
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/login');
    } else {
      setError(data.error || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold mb-2 text-blue-700 text-center">Create Your Account</h1>
          <p className="text-gray-500 dark:text-gray-300 mb-6 text-center text-base">Sign up to start uploading, organizing, and analyzing your screenshots with AI.</p>
          <RegisterForm onSubmit={handleRegister} error={error} />
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">Login</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
