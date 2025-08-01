"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout');
    setUser(null);
    router.push('/');
  }

  // Navigation links
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/contact', label: 'Contact' },
    ...(user ? [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/upload', label: 'Upload' },
      { href: '/notes', label: 'Notes' },
    ] : [
      { href: '/login', label: 'Login' },
      { href: '/register', label: 'Register' },
    ])
  ];

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md dark:bg-gray-900 relative z-20">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-white">Snapeek</Link>
      </div>
      {/* Desktop Nav */}
      <ul className="hidden md:flex items-center gap-6">
        {navLinks.map(link => (
          <motion.li key={link.href} className="relative">
            <Link
              href={link.href}
              className={`block px-2 py-1 ${router.pathname === link.href ? 'font-semibold text-blue-600' : 'text-gray-800 dark:text-gray-200'}`}
            >
              {link.label}
            </Link>
            {router.pathname === link.href && (
              <motion.div
                className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-white"
                layoutId="underline"
              />
            )}
          </motion.li>
        ))}
        {user && (
          <motion.li className="relative">
            <button className="text-red-500 hover:underline px-2 py-1" onClick={handleLogout}>Logout</button>
          </motion.li>
        )}
      </ul>
      {/* Hamburger for mobile/tablet */}
      <button
        className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen(m => !m)}
      >
        {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
      </button>
      {/* Mobile/Tablet Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 md:hidden z-30"
          >
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`w-full text-center py-2 px-4 text-lg ${router.pathname === link.href ? 'font-semibold text-blue-600' : 'text-gray-800 dark:text-gray-200'}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <button className="w-full text-center py-2 px-4 text-lg text-red-500 hover:underline" onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Footer component
export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 mt-12 text-center text-gray-600 dark:text-gray-400 text-sm">
      <span>Created by <span className="font-semibold text-white">Crosseye Company</span>. Owner: <span className="font-semibold text-blue-600">Devid</span>.</span>
    </footer>
  );
}
