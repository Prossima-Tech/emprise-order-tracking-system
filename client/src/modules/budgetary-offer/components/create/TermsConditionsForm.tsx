// src/components/create/TermsConditionsForm.tsx

import React from 'react';
import { Form, Typography } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title } = Typography;

const DEFAULT_TERMS = `
• Payment Terms: 80% payment on material supply and balance 20% after successful installation

• If any variation in GST Rate/Structure happens during execution of contract, the same shall be applicable as per Government Notification(s).

• Quote Validity: 90 Days from the date of this offer.

• Compressed air, electricity, and water to be arranged by Indian Railways free of cost on site.

• Material supply will be accompanied by Works Test Certificate from OEM with physical presence and with in-house testing facilities in India along with a comprehensive service network for ensuring quality of supply.
`;

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  ['clean']
];

interface TermsConditionsFormProps {
  form: any;
}

export const TermsConditionsForm: React.FC<TermsConditionsFormProps> = ({ form }) => {
  return (
    <>
      <Title level={4}>Terms and Conditions</Title>
      <div className="mb-6">
        <Form.Item
          name="termsAndConditions"
          initialValue={DEFAULT_TERMS}
          rules={[
            { 
              required: true, 
              message: 'Please enter terms and conditions' 
            },
            {
              validator: (_, value) => {
                if (!value || value.trim() === '') {
                  return Promise.reject(new Error('Terms and conditions cannot be empty'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <ReactQuill
            theme="snow"
            modules={{
              toolbar: toolbarOptions
            }}
            className="h-64 mb-12"
          />
        </Form.Item>
      </div>
    </>
  );
};

export default TermsConditionsForm;