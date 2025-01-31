// src/components/create/BasicInfoForm.tsx

import React from 'react';
import { Form, Input, DatePicker, Typography } from 'antd';
import moment from 'moment';

const { Title } = Typography;

interface BasicInfoFormProps {
  form: any;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ form }) => {
  return (
    <>
      <Title level={4}>Basic Information</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="offerDate"
          label="Offer Date"
          rules={[{ required: true, message: 'Please select offer date' }]}
        >
          <DatePicker 
            className="w-full" 
            disabledDate={(current) => current && current > moment().endOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="fromAuthority"
          label="From Authority"
          rules={[{ required: true, message: 'Please enter from authority' }]}
        >
          <Input maxLength={100} />
        </Form.Item>

        <Form.Item
          name="toAuthority"
          label="To Authority"
          rules={[{ required: true, message: 'Please enter to authority' }]}
        >
          <Input maxLength={100} />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Please enter subject' }]}
        >
          <Input maxLength={200} />
        </Form.Item>
      </div>
    </>
  );
};

export default BasicInfoForm;