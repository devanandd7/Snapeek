import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ImageCard from '../components/Dashboard/ImageCard';

export default function DashboardPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(''); // State for displaying messages
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [openDropdowns, setOpenDropdowns] = useState({}); // State to manage expanded image details
  const [selectedFolder, setSelectedFolder] = useState('All Images'); // State for selected folder
  const [openModalImg, setOpenModalImg] = useState(null); // Track which image's modal is open
  const [autoDeleteDays, setAutoDeleteDays] = useState(3);

  // Function to show a temporary message
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000); // Message disappears after 3 seconds
  };

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/images/Img_index');
        const data = await res.json();
        if (res.ok) {
          setImages(data.images);
          // Set "All Images" as default selected folder on initial load
          setSelectedFolder('All Images');
        } else {
          setError(data.error || 'Failed to load images');
          showMessage(data.error || 'Failed to load images', 'error');
        }
      } catch (err) {
        setError('Network error or server unreachable.');
        showMessage('Network error or server unreachable.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }
    fetchUser();
  }, []);

  // Groups images by their folder name and returns unique folder names
  const getFolders = (images) => {
    const folders = new Set();
    images.forEach(img => {
      folders.add(img.folder || 'Uncategorized');
    });
    return ['All Images', ...Array.from(folders).sort()];
  };

  const folders = getFolders(images);

  // Filters images based on the selected folder
  const filteredImages = selectedFolder === 'All Images'
    ? images
    : images.filter(img => (img.folder || 'Uncategorized') === selectedFolder);

  const handleAnalyzeAI = async (imgId) => {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: imgId }),
      });
      const data = await res.json();
      if (res.ok) {
        setImages(prevImages =>
          prevImages.map(i =>
            i._id === imgId ? { ...i, description: data.description } : i
          )
        );
        showMessage('AI analysis successful!', 'success');
      } else {
        showMessage(data.error || 'AI analysis failed', 'error');
      }
    } catch (err) {
      showMessage('Network error during AI analysis.', 'error');
    }
  };

  const toggleDropdown = (publicId) => {
    setOpenDropdowns(prev => ({ ...prev, [publicId]: !prev[publicId] }));
  };

  // Add delete handler
  const handleDeleteImage = async (img) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`/api/images/${encodeURIComponent(img.public_id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setImages(prev => prev.filter(i => i.public_id !== img.public_id));
        showMessage('Image deleted successfully!', 'success');
      } else {
        const data = await res.json();
        showMessage(data.error || 'Failed to delete image', 'error');
      }
    } catch (err) {
      showMessage('Network error during delete.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8 px-2 sm:px-4 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Folder List */}
        <aside className="w-full lg:w-1/4 mb-8 lg:mb-0 bg-white dark:bg-gray-850 rounded-xl shadow-lg p-4 sm:p-6 h-fit">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-black border-b pb-3 border-gray-200 dark:border-gray-700">
            Folders
          </h2>
          <nav>
            <ul>
              {folders.map(folder => (
                <li key={folder} className="mb-2">
                  <button
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full text-left py-2 px-4 rounded-lg transition-all duration-200
                      ${selectedFolder === folder
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {folder}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Right Content: Image Display */}
        <section className="w-full lg:w-3/4">
          {/* Welcome message for authenticated user */}
          {user && (
            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg shadow-md text-center">
              <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Welcome, <span className="text-blue-600 dark:text-blue-400">{user.username}</span>!
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You're logged in as {user.email}.
              </p>
            </div>
          )}

          {/* Global message display */}
          {message && (
            <div className={`p-3 mb-6 rounded-lg text-center font-medium ${
              messageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center lg:text-left">All Your Images</h1>

          {/* Loading, error, and empty states */}
          {loading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
              <p className="text-lg">Loading your images...</p>
            </div>
          )}
          {error && (
            <div className="text-red-500 bg-red-100 dark:bg-red-900 p-4 rounded-lg text-center">
              Error: {error}
            </div>
          )}
          {!loading && !error && filteredImages.length === 0 && (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400 text-lg">
              <svg className="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L20 20m-4-2h4m-4 0a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h2m-4-2v4h4m-4-4l4 4m-4-4l4-4m-4 4l4-4" />
              </svg>
              <p>No images found in this folder.</p>
              <p className="text-sm mt-2">Try selecting a different folder or uploading new images.</p>
            </div>
          )}

          {/* Add auto-delete days selector above the image grid */}
          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="autoDeleteDays" className="font-semibold text-sm">Auto-delete after</label>
            <input
              id="autoDeleteDays"
              type="number"
              min={1}
              max={30}
              value={autoDeleteDays}
              onChange={e => setAutoDeleteDays(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center text-sm"
            />
            <span className="text-sm">days</span>
          </div>

          {/* Image display for selected folder */}
          {!loading && !error && filteredImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map(img => (
                <div key={img.public_id} className="flex flex-col">
                  <ImageCard
                    img={img}
                    onDelete={() => handleDeleteImage(img)}
                    onView={setOpenModalImg}
                    autoDeleteDays={3}
                    onToggleDropdown={toggleDropdown}
                    isDropdownOpen={!!openDropdowns[img.public_id]}
                  />
                  {/* Analyze AI button below the card if no description */}
                  {!img.description && (
                    <button
                      onClick={() => handleAnalyzeAI(img._id)}
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md shadow-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 text-sm font-semibold flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673m-4.673 0l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5V20m0 0l-1.5-1.5m1.5 1.5l1.5-1.5M12 17l1.5-1.5M12 17H9.577M12 17h4.843A3.478 3.478 0 0020 13.588V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7.588A3.478 3.478 0 007.423 17z"></path></svg>
                      Analyze AI
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      {/* Modal for AI Description and Image */}
      {openModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setOpenModalImg(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={openModalImg.url}
              alt={openModalImg.description || 'Uploaded image'}
              className="w-full h-48 object-cover rounded mb-4"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/cccccc/333333?text=Image+Error`; }}
            />
            <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">AI Description</h3>
            <div className="text-gray-800 dark:text-gray-100 text-base whitespace-pre-line">
              {openModalImg.description || <span className="italic text-gray-400">No AI description yet. Click "Analyze AI" on the image card.</span>}
            </div>

           
          </div>
        </div>
      )}
      {/* Custom Scrollbar Style and new Animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #666;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999;
        }

        /* Keyframe for subtle background gradient animation */
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradient-animation 15s ease infinite; /* Slower animation */
        }

        /* Keyframe for fade-in effect on image cards */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
