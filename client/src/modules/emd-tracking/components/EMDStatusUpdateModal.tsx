import { useState } from 'react';
import { EMDStatus, EMDStatusUpdateInput } from '@emprise/shared/src/types/emd';
import { DocumentUpload } from '../../../components/shared/DocumentUpload';

interface EMDStatusUpdateModalProps {
  open: boolean;
  currentStatus: EMDStatus;
  onCancel: () => void;
  onSubmit: (data: EMDStatusUpdateInput) => Promise<void>;
}

export const EMDStatusUpdateModal = ({
  open,
  currentStatus,
  onCancel,
  onSubmit,
}: EMDStatusUpdateModalProps) => {
  const [formData, setFormData] = useState<EMDStatusUpdateInput>({
    status: EMDStatus.PENDING,
    remarks: '',
    documentPath: '',
  });

  const getAvailableStatuses = (current: EMDStatus): EMDStatus[] => {
    const statusFlow: Record<EMDStatus, EMDStatus[]> = {
      [EMDStatus.PENDING]: [EMDStatus.SUBMITTED],
      [EMDStatus.SUBMITTED]: [EMDStatus.VERIFIED, EMDStatus.FORFEITED],
      [EMDStatus.VERIFIED]: [EMDStatus.RETURNED, EMDStatus.FORFEITED],
      [EMDStatus.RETURNED]: [],
      [EMDStatus.FORFEITED]: [],
    };
    return statusFlow[current] || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({
        status: EMDStatus.PENDING,
        remarks: '',
        documentPath: '',
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 md:mx-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Update EMD Status</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as EMDStatus})}
                required
              >
                <option value="">Select status</option>
                {getAvailableStatuses(currentStatus).map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {formData.status === EMDStatus.SUBMITTED && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supporting Document
                </label>
                <DocumentUpload
                  onUpload={(path) => setFormData({...formData, documentPath: path})}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};