// src/modules/purchase-orders/components/UpdateStatusModal.tsx
import { Modal, Form, Select, Input } from 'antd';
import { PurchaseOrder, POStatus } from '@emprise/shared/src/types/purchase-order';
import { purchaseOrderApi } from '../services/api';

interface UpdateStatusModalProps {
  po: PurchaseOrder | null;
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const UpdateStatusModal = ({
  po,
  open,
  onCancel,
  onSuccess,
}: UpdateStatusModalProps) => {
  const [form] = Form.useForm();

  const getAvailableStatuses = (currentStatus: POStatus): POStatus[] => {
    const statusFlow: Record<POStatus, POStatus[]> = {
      [POStatus.DRAFT]: [POStatus.ISSUED, POStatus.CANCELLED],
      [POStatus.ISSUED]: [POStatus.IN_PROGRESS, POStatus.CANCELLED],
      [POStatus.IN_PROGRESS]: [POStatus.COMPLETED, POStatus.CANCELLED],
      [POStatus.COMPLETED]: [],
      [POStatus.CANCELLED]: [],
    };
    return statusFlow[currentStatus] || [];
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (po) {
        await purchaseOrderApi.updateStatus(po.id, values.status, values.remarks);
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Modal
      title="Update Status"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="status"
          label="New Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select>
            {po && getAvailableStatuses(po.status as POStatus).map(status => (
              <Select.Option key={status} value={status}>
                {status.replace('_', ' ')}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="remarks"
          label="Remarks"
          rules={[{ required: true, message: 'Please enter remarks' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};