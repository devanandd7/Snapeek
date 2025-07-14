import { useState } from 'react';

export default function FolderList({ groupedImages, onSelectFolder, selectedFolder }) {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {Object.keys(groupedImages).map(folder => (
        <div
          key={folder}
          className={`flex flex-col items-center cursor-pointer p-4 rounded-lg border shadow transition ${
            selectedFolder === folder ? 'bg-blue-100 border-blue-400' : 'bg-white dark:bg-gray-800'
          }`}
          onClick={() => onSelectFolder(folder)}
        >
          <span className="text-4xl mb-2">📁</span>
          <span className="font-semibold">{folder}</span>
          <span className="text-xs text-gray-500">{groupedImages[folder].length} images</span>
        </div>
      ))}
    </div>
  );
}
