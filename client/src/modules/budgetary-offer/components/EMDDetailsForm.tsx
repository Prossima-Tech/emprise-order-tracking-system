import React from 'react';
import { Form, InputNumber, Select, Input } from 'antd';

const { Option } = Select;

export const EMDDetailsForm: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Form.Item
        name={['emdDetails', 'amount']}
        label="EMD Amount"
        rules={[{ required: true, message: 'Please enter EMD amount' }]}
      >
        <InputNumber min={0} className="w-full" />
      </Form.Item>

      <Form.Item
        name={['emdDetails', 'paymentMode']}
        label="Payment Mode"
        rules={[{ required: true, message: 'Please select payment mode' }]}
      >
        <Select>
          <Option value="DD">DD</Option>
          <Option value="BG">BG</Option>
          <Option value="ONLINE">ONLINE</Option>
          <Option value="CASH">CASH</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name={['emdDetails', 'validityPeriod']}
        label="Validity Period (Days)"
      >
        <InputNumber min={1} className="w-full" />
      </Form.Item>

      <Form.Item
        name={['emdDetails', 'remarks']}
        label="Remarks"
      >
        <Input.TextArea rows={4} />
      </Form.Item>
    </div>
  );
};

export default EMDDetailsForm;