// components/shared/DocumentUpload.tsx
import React, { useRef, useState } from 'react';

interface DocumentUploadProps {
  onUpload: (path: string) => void;
  value?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    try {
      // Implement your file upload logic here
      // For example:
      // const path = await uploadFile(file);
      // onUpload(path);
      
      // Temporary mock implementation
      setTimeout(() => {
        onUpload(`/uploads/${file.name}`);
        setUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 
                   hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                   disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>
        {fileName && (
          <span className="text-sm text-gray-500">{fileName}</span>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      {uploading && (
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};