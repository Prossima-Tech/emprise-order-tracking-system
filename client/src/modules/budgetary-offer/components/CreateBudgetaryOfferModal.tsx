import { Modal, Form, Input, InputNumber, DatePicker } from 'antd';
import { BudgetaryOfferCreateInput } from '@emprise/shared/src/types/budgetary-offer';
import { budgetaryOfferService } from '../services';
import styles from './CreateBudgetaryOfferModal.module.css';

interface CreateBudgetaryOfferModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateBudgetaryOfferModal = ({
  open,
  onCancel,
  onSuccess,
}: CreateBudgetaryOfferModalProps) => {
  const [form] = Form.useForm<BudgetaryOfferCreateInput>();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await budgetaryOfferService.create({
        ...values,
        dueDate: values.dueDate.toString(),
      });
      form.resetFields();
      onSuccess();
    } catch (error) {
      // Error handling
    }
  };

  return (
    <Modal
      title="Create Budgetary Offer"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={720}
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.form}
      >
        <Form.Item
          name="tenderNo"
          label="Tender Number"
          rules={[{ required: true, message: 'Please enter tender number' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: 'Please enter amount' }]}
        >
          <InputNumber
            className={styles.numberInput}
            formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/₹\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="emdAmount"
          label="EMD Amount"
          rules={[{ required: true, message: 'Please enter EMD amount' }]}
        >
          <InputNumber
            className={styles.numberInput}
            formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/₹\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Due Date"
          rules={[{ required: true, message: 'Please select due date' }]}
        >
          <DatePicker className={styles.datePicker} />
        </Form.Item>
      </Form>
    </Modal>
  );
};