import { useState } from 'react';

export default function RegisterForm({ onSubmit, error }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ username, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">Register</h2>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <label className="flex flex-col gap-1">
        Username
        <input
          type="text"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        Email
        <input
          type="email"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        Password
        <input
          type="password"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Register</button>
    </form>
  );
}
