import React, { useState, useMemo } from 'react';
import { Download, Trash2, Eye, ChevronDown, Bot, ImageOff, Loader2 } from 'lucide-react';

// ImageCard component
export default function ImageCard({
  img,
  onDelete,
  onView,
  onAnalyzeAI,
  autoDeleteDays = 3,
  onToggleDropdown,
  isDropdownOpen
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const timeLeft = useMemo(() => {
    const created = new Date(img.createdAt);
    const expires = new Date(created.getTime() + autoDeleteDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = expires - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    return `${days}d ${hours}h ${minutes}m`;
  }, [img.createdAt, autoDeleteDays]);

  const handleImageError = (e) => {
    setImageError(true);
    setImageLoaded(true);
    e.target.onerror = null;
    e.target.src = `https://placehold.co/600x400/cccccc/333333?text=Image+Error`;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="
      relative flex flex-col bg-white dark:bg-gray-850 rounded-xl shadow-lg
      hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
      w-full max-w-xs mx-auto overflow-hidden
      group
    ">
      {onView && (
        <button
          onClick={() => onView(img)}
          className="
            absolute top-3 right-3 p-2 bg-black bg-opacity-40 rounded-full text-white
            hover:bg-opacity-60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
            z-10 opacity-0 group-hover:opacity-100
          "
          title="View AI Description"
          aria-label="Show image details"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}

      <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {!imageLoaded && (
          <Loader2 className="animate-spin text-gray-500 dark:text-gray-400 w-8 h-8" />
        )}
        {imageError && imageLoaded && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <ImageOff className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">Image failed to load</p>
          </div>
        )}
        <img
          src={img.url}
          alt={img.description || 'Uploaded image'}
          className={`object-cover w-full h-full rounded-t-xl
            ${imageLoaded && !imageError ? 'block' : 'hidden'}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between text-gray-900 dark:text-gray-100">
        <div className="mb-3">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Folder: <span className="font-normal text-gray-600 dark:text-gray-400">{img.folder || 'Uncategorized'}</span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            Uploaded: <span className="font-normal text-gray-600 dark:text-gray-400">{new Date(img.createdAt).toLocaleString()}</span>
          </div>
          <div className={`text-sm font-semibold ${timeLeft === 'Expired' ? 'text-red-600' : 'text-orange-500'} dark:text-orange-400 mb-2`}>
            Auto-delete in: <span className="font-normal">{timeLeft}</span>
          </div>
        </div>

        <div className="relative mb-3">
          <button
            onClick={() => onToggleDropdown && onToggleDropdown(img.public_id)}
            className="
              w-full text-left px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200
              rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-semibold transition
              flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            disabled={!onToggleDropdown}
          >
            <span>AI Description</span>
            <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`
            transition-all duration-300 ease-in-out bg-blue-50 dark:bg-blue-950 p-3 rounded-lg
            text-sm text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800
            max-h-32 overflow-y-auto custom-scrollbar mt-2
            ${isDropdownOpen ? 'opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
          `}>
            {img.description || <span className="italic text-gray-500 dark:text-gray-400">No AI description yet. Click "Analyze AI" below.</span>}
          </div>
        </div>

        {/* Action Buttons - Arranged horizontally */}
        <div className="flex justify-between gap-2 mt-2">
          {onAnalyzeAI && (
            <button
              onClick={() => onAnalyzeAI(img._id)}
              className="
                flex-1 flex items-center justify-center p-2 bg-purple-600 text-white rounded-lg
                text-sm font-medium hover:bg-purple-700 transition duration-200 shadow-md
                focus:outline-none focus:ring-2 focus:ring-purple-500
              "
              title="Analyze AI"
            >
              <Bot className="w-4 h-4" />
            </button>
          )}
          <a
            href={img.url}
            download
            className="
              flex-1 flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg
              text-sm font-medium hover:bg-blue-700 transition duration-200 shadow-md
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </a>
          {onDelete && (
            <button
              onClick={() => onDelete(img)}
              className="
                flex-1 flex items-center justify-center p-2 bg-red-500 text-white rounded-lg
                text-sm font-medium hover:bg-red-600 transition duration-200 shadow-md
                focus:outline-none focus:ring-2 focus:ring-red-500
              "
              title="Delete Image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
