interface DocumentPreviewProps {
  url: string;
  visible: boolean;
  onClose: () => void;
}

export const DocumentPreview = ({ url, visible, onClose }: DocumentPreviewProps) => {
  if (!visible) return null;

  const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 md:mx-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Document Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {isImage ? (
              <img
                src={url}
                alt="Document Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                src={url}
                title="Document Preview"
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};