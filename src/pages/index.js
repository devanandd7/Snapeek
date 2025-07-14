import Navbar from '../components/Navbar';

const screenshots = [
  '/file.svg',
  '/window.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto py-16 px-4 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-blue-700 drop-shadow-lg">Welcome to Snapeek</h1>
          <p className="text-xl mb-6 max-w-2xl text-gray-700 dark:text-gray-200">
            Instantly upload, organize, and analyze your screenshots with AI. Secure, fast, and beautifully simple.
          </p>
          <div className="flex gap-4 mb-8">
            <a href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-lg shadow">Login</a>
            <a href="/register" className="px-8 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 font-bold text-lg shadow">Register</a>
          </div>
          <img src="/window.svg" alt="Screenshot Example" className="w-64 h-40 object-contain rounded-xl shadow-lg border mb-4" />
        </section>

        {/* Features Section */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <span className="text-4xl mb-2">🔒</span>
            <h3 className="font-bold text-lg mb-1 text-blue-600">Secure Auth</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">Sign up and log in securely. Your privacy is our priority.</p>
          </div>
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <span className="text-4xl mb-2">☁️</span>
            <h3 className="font-bold text-lg mb-1 text-blue-600">Cloud Uploads</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">Upload one or many screenshots to Cloudinary, organized by AI.</p>
          </div>
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <span className="text-4xl mb-2">🤖</span>
            <h3 className="font-bold text-lg mb-1 text-blue-600">AI Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">Get instant, smart descriptions and categories for your images.</p>
          </div>
        </section>

        {/* Screenshot Gallery */}
        <section className="w-full mb-16">
          <h2 className="text-2xl font-bold mb-4 text-blue-500 text-center">Screenshot Gallery</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            {screenshots.map((src, idx) => (
              <div key={idx} className="w-40 h-28 bg-white dark:bg-gray-800 rounded-xl shadow flex items-center justify-center border">
                <img src={src} alt={`Screenshot ${idx + 1}`} className="object-contain w-32 h-20" />
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="w-full bg-white dark:bg-gray-800 rounded-xl shadow p-8 mt-8">
          <h2 className="text-2xl font-bold mb-2 text-blue-500">About Snapeek</h2>
          <ul className="list-disc pl-6 space-y-2 text-base">
            <li>Sign up and log in securely (no passwords stored securely, demo only!)</li>
            <li>Upload one or many screenshots to Cloudinary</li>
            <li>AI (Gemini Flash) analyzes images and generates descriptions</li>
            <li>Organize images into custom folders</li>
            <li>Dashboard to view uploads, AI info, and download images</li>
            <li>Images auto-delete after 3 days for privacy</li>
          </ul>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <strong>Tech Stack:</strong> Next.js, MongoDB Atlas, Cloudinary, Gemini Flash API, Cookie-based Auth
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full flex flex-col items-center mt-16">
          <h2 className="text-2xl font-bold mb-2 text-blue-600">Ready to get started?</h2>
          <a href="/register" className="mt-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-bold text-lg shadow hover:from-blue-600 hover:to-blue-800">Create your free account</a>
        </section>
      </main>
    </div>
  );
}