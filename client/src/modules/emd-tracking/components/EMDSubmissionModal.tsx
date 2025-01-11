// src/modules/emd-tracking/components/EMDSubmissionModal.tsx
import { useState } from 'react';
import { EMDSubmissionInput } from '../../../types/emd';
import { parseDecimal } from '../../../utils/transform';
import { emdApi } from '../services';

interface EMDSubmissionModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EMDSubmissionModal = ({
  open,
  onCancel,
  onSuccess,
}: EMDSubmissionModalProps) => {
  const [formData, setFormData] = useState<EMDSubmissionInput>({
    offerId: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await emdApi.submitEMD({
        ...formData,
        amount: parseDecimal(formData.amount)
      });
      onSuccess();
      setFormData({
        offerId: '',
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
    } catch (error) {
      console.error('Error submitting EMD:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 md:mx-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Submit EMD</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer
              </label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.offerId}
                onChange={(e) => setFormData({...formData, offerId: e.target.value})}
                required
              >
                <option value="">Select offer</option>
                {/* Add options here */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EMD Amount
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseDecimal(e.target.value)})}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={typeof formData.dueDate === 'string' ? formData.dueDate : formData.dueDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={formData.remarks || ''}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
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
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};