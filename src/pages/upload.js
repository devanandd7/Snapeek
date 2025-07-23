import Navbar from '../components/Navbar';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ImageCard from '../components/Dashboard/ImageCard';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const [files, setFiles] = useState([]); // [{file, preview, status, error, uploadedImage, name, size, type, lastModified}]
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [makeNotesForStudy, setMakeNotesForStudy] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Restore queue from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('snapeek_upload_queue');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore queued or uploading items (not done/error)
        setFiles(parsed.filter(f => f.status === 'queued' || f.status === 'uploading'));
      } catch {}
    }
  }, []);

  // Save queue to localStorage whenever files change
  useEffect(() => {
    if (files.length > 0) {
      // Only save serializable info (no File/Blob objects)
      const serializable = files.map(f => ({
        name: f.file?.name || f.name,
        size: f.file?.size || f.size,
        type: f.file?.type || f.type,
        lastModified: f.file?.lastModified || f.lastModified,
        preview: f.preview,
        status: f.status,
        error: f.error,
        uploadedImage: f.uploadedImage || null,
      }));
      localStorage.setItem('snapeek_upload_queue', JSON.stringify(serializable));
    } else {
      localStorage.removeItem('snapeek_upload_queue');
    }
  }, [files]);

  // Enhance onDrop to add status to each file, and avoid duplicates
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prevFiles => {
      // Avoid adding duplicates (by name+size+lastModified)
      const existingKeys = new Set(prevFiles.map(f => `${f.file?.name || f.name}-${f.file?.size || f.size}-${f.file?.lastModified || f.lastModified}`));
      const newFiles = acceptedFiles.filter(file => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`));
      return [
        ...prevFiles,
        ...newFiles.map(file => ({
          file,
          preview: URL.createObjectURL(file),
          status: 'queued',
          error: '',
          uploadedImage: null,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        }))
      ];
    });
    setMessage('');
    setError('');
  }, []);

  // Upload queue system (restore File objects if needed)
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!files.length) {
      setError('Please select at least one image.');
      return;
    }
    setUploading(true);
    let newFiles = [...files];
    let uploadedImages = [];
    for (let i = 0; i < newFiles.length; i++) {
      if (newFiles[i].status === 'done') continue;
      // If file is missing (restored from localStorage), reconstruct from File API if possible
      let fileObj = newFiles[i].file;
      if (!fileObj && window.File && window.Blob) {
        try {
          // Try to reconstruct File from info (will not have data, so skip upload)
          fileObj = null;
        } catch {}
      }
      if (!fileObj) {
        newFiles[i].status = 'error';
        newFiles[i].error = 'File not available (refresh and re-add)';
        setFiles([...newFiles]);
        continue;
      }
      newFiles[i].status = 'uploading';
      setFiles([...newFiles]);
      try {
        const imageBase64 = await fileToBase64(fileObj);
        const res = await fetch('/api/images/Img_index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64,
            makeNotesForStudy: makeNotesForStudy 
          }),
        });
        const data = await res.json();
        if (res.ok) {
          newFiles[i].status = 'done';
          newFiles[i].uploadedImage = data.image;
          uploadedImages.push(data.image);
        } else {
          newFiles[i].status = 'error';
          newFiles[i].error = data.error || 'Upload failed';
        }
      } catch (err) {
        newFiles[i].status = 'error';
        newFiles[i].error = 'Upload failed';
      }
      setFiles([...newFiles]);
    }
    setUploading(false);
    if (uploadedImages.length) {
      setMessage('Upload successful!');
      setImages(uploadedImages);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: true,
    onDrop
  });

  // Remove file from queue
  function removeFile(idx) {
    setFiles(files => files.filter((_, i) => i !== idx));
  }

  // Handle AI analysis for uploaded images
  async function handleAnalyzeAI(imageId) {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update the image in files state with new description
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.uploadedImage && f.uploadedImage._id === imageId 
              ? { ...f, uploadedImage: { ...f.uploadedImage, description: data.description } }
              : f
          )
        );
        setMessage('AI analysis completed!');
      } else {
        setError(data.error || 'AI analysis failed');
      }
    } catch (err) {
      setError('Failed to analyze image with AI');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-xl mx-auto py-12">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">Upload Image</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          {error && <div className="text-red-500 text-center">{error}</div>}
          {message && (
            <div className="flex items-center justify-center gap-2 text-green-600 text-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {message}
            </div>
          )}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 dark:border-gray-700'
            }`}
            style={{ minHeight: 180 }}
          >
            <input {...getInputProps()} />
            <svg className="w-12 h-12 mb-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4m0 0l5-5m-5 5l5 5" />
            </svg>
            {isDragActive ? (
              <p className="text-blue-700 font-semibold">Drop the image here ...</p>
            ) : (
              <p>
                <span className="text-blue-600 font-semibold underline">Click to select</span> or drag & drop image(s) here
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">You can select multiple images. JPG, PNG, GIF supported.</p>
          </div>
          
          {/* Notes Feature Checkbox */}
          <div className="flex items-center gap-3 mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <input
              type="checkbox"
              id="makeNotesForStudy"
              checked={makeNotesForStudy}
              onChange={(e) => setMakeNotesForStudy(e.target.checked)}
              className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="makeNotesForStudy" className="flex flex-col cursor-pointer">
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">📚 Generate Study Notes</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">AI will create handwritten-style study notes from your images</span>
            </label>
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-2 items-center justify-center w-full">
              {files.map((fileObj, idx) => (
                <div key={idx} className="relative w-32 h-32 border-2 border-blue-200 rounded-xl overflow-hidden shadow flex flex-col items-center justify-center bg-white dark:bg-gray-900">
                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">{idx + 1}</span>
                  <img
                    src={fileObj.preview}
                    alt={fileObj.file?.name || fileObj.name || 'Image'}
                    className="object-cover w-full h-20 rounded-t"
                    onLoad={() => fileObj.preview && URL.revokeObjectURL(fileObj.preview)}
                  />
                  <div className="w-full flex-1 flex flex-col items-center justify-center px-1 py-1">
                    <span className="text-xs text-gray-700 dark:text-gray-200 truncate w-full text-center">
                      {fileObj.file?.name || fileObj.name || 'Image'}
                    </span>
                    <span className="text-xs mt-1">
                      {fileObj.status === 'queued' && <span className="text-yellow-500">Queued</span>}
                      {fileObj.status === 'uploading' && <span className="text-blue-500">Uploading...</span>}
                      {fileObj.status === 'done' && <span className="text-green-600">Done</span>}
                      {fileObj.status === 'error' && <span className="text-red-500">Error</span>}
                    </span>
                    {fileObj.error && <span className="text-xs text-red-500">{fileObj.error}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Remove"
                    disabled={fileObj.status === 'uploading'}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="submit"
            className={`px-6 py-3 rounded-xl font-bold text-lg transition ${
              uploading
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'
            }`}
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </button>
        </form>
        <hr className="my-10" />
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Uploaded Images</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {/* Only show uploaded images from current session */}
          {files.filter(f => f.status === 'done' && f.uploadedImage).map(f => (
            <ImageCard 
              key={f.uploadedImage.public_id} 
              img={f.uploadedImage}
              onToggleDropdown={(id) => setOpenDropdowns(prev => ({...prev, [id]: !prev[id]}))}
              isDropdownOpen={openDropdowns[f.uploadedImage.public_id] || false}
              onAnalyzeAI={handleAnalyzeAI}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
