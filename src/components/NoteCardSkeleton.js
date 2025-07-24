import React from 'react';

const NoteCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg p-5 animate-pulse">
      {/* Image Placeholder */}
      <div className="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
      
      {/* Title Placeholder */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
      
      {/* Subject/Date Placeholder */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
      
      {/* Content Preview Placeholder */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      
      {/* Buttons Placeholder */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
};

export default NoteCardSkeleton;
