import React from 'react';
import { 
  Form, 
  InputNumber, 
  Select, 
  Input, 
  DatePicker, 
  Space, 
  Typography, 
  Card,
  Row,
  Col,
  Tooltip,
  Divider,
  Upload,
  Button,
  message
} from 'antd';
import { 
  InfoCircleOutlined, 
  BankOutlined, 
  CalendarOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileImageOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface EMDDetailsFormProps {
  totalAmount?: number;
  onChange?: (values: any) => void;
  value?: any;
}

// Define accepted file types for FDR documents
const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

const paymentModes = [
  { 
    value: 'BANK_GUARANTEE', 
    label: 'Bank Guarantee',
    // description: 'A guarantee from a bank ensuring payment'
  },
  { 
    value: 'DEMAND_DRAFT', 
    label: 'Demand Draft',
    // description: 'A banker\'s draft payable on demand'
  },
  { 
    value: 'FIXED_DEPOSIT', 
    label: 'Fixed Deposit Receipt',
    // description: 'FDR pledged in favor of the authority'
  },
  { 
    value: 'ONLINE_TRANSFER', 
    label: 'Online Transfer',
    // description: 'Direct bank transfer or NEFT/RTGS'
  },
];

export const EMDDetailsForm: React.FC<EMDDetailsFormProps> = ({ 
  totalAmount = 0,
  onChange,
  value = {}
}) => {
  // Parser for currency values that ensures proper formatting and type safety
  const parseCurrencyValue = (displayValue: string | undefined): number => {
    const cleanValue = displayValue ? displayValue.replace(/[₹\s,]/g, '') : '0';
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Parser for validity period that ensures type safety
  const parseValidityPeriod = (displayValue: string | undefined): number => {
    const parsed = displayValue ? parseInt(displayValue.replace(' Days', '')) : 1;
    if (isNaN(parsed)) return 1;
    if (parsed < 1) return 1;
    if (parsed > 365) return 365;
    return parsed;
  };

  // Function to get the appropriate icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    if (extension === 'pdf') return <FilePdfOutlined />;
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) return <FileImageOutlined />;
    return <FileImageOutlined />;
  };

  // Upload file validation
  const beforeUpload = (file: File) => {
    // Check file type
    const isValidType = Object.entries(acceptedFileTypes).some(([mimeType, extensions]) => {
      return file.type === mimeType || extensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
    });

    if (!isValidType) {
      message.error('You can only upload PDF, JPG, or PNG files!');
      return Upload.LIST_IGNORE;
    }

    // Check file size (limit to 5MB)
    const isLessThan5MB = file.size / 1024 / 1024 < 5;
    if (!isLessThan5MB) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  return (
    <div className="space-y-6">
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <Form.Item
            name={['emdDetails', 'amount']}
            label={
              <Space>
                EMD Amount
                <Tooltip title="Enter the EMD amount manually">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: 'Please enter EMD amount' },
              { type: 'number', min: 0, message: 'Amount must be greater than 0' }
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseCurrencyValue}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name={['emdDetails', 'paymentMode']}
            label={
              <Space>
                Payment Mode
                <Tooltip title="Select the mode of EMD payment">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: 'Please select payment mode' }]}
          >
            <Select placeholder="Select payment mode">
              {paymentModes.map(mode => (
                <Option key={mode.value} value={mode.value}>
                  <Space>
                    <BankOutlined />
                    <div>
                      <div>{mode.label}</div>
                      {/* <div className="text-xs text-gray-400">{mode.description}</div> */}
                    </div>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name={['emdDetails', 'validityPeriod']}
            label={
              <Space>
                Validity Period
                <Tooltip title="Number of days the EMD remains valid">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: 'Please enter validity period' }]}
          >
            <InputNumber
              className="w-full"
              min={1}
              max={365}
              formatter={value => `${value} Days`}
              parser={parseValidityPeriod}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name={['emdDetails', 'submissionDate']}
            label={
              <Space>
                Submission Date
                <Tooltip title="Date when EMD will be submitted">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: 'Please select submission date' }]}
          >
            <DatePicker 
              className="w-full"
              format="DD-MM-YYYY"
              placeholder="Select date"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name={['emdDetails', 'bankDetails']}
            label={
              <Space>
                Bank Details
                <Tooltip title="Bank account details for EMD submission">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: 'Please enter bank details' }]}
          >
            <Input.TextArea 
              rows={1}
              placeholder="Enter bank account details"
            />
          </Form.Item>
        </Col>

        {/* Document Upload Section */}
        <Col span={12}>
          <Form.Item
            name={['emdDetails', 'document']}
            label={
              <Space>
                FDR Document
                <Tooltip title="Upload FDR document (PDF, JPG, or PNG format)">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </Space>
            }
            rules={[
              { 
                required: false, 
                message: 'Please upload FDR document' 
              }
            ]}
            extra="Supported formats: PDF, JPG, PNG (Max: 5MB)"
          >
            <Upload
              accept=".pdf,.jpg,.jpeg,.png"
              maxCount={1}
              beforeUpload={beforeUpload}
              listType="text"
              className="w-full"
            >
              <Button icon={<UploadOutlined />} className="w-full">
                Upload Document
              </Button>
            </Upload>
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            name={['emdDetails', 'remarks']}
            label="Additional Remarks"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter any additional remarks or special instructions"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Summary Section */}
      <Divider dashed />
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-medium mb-2">EMD Summary</div>
        <Row gutter={[16, 8]} className="text-sm">
          <Col span={12}>
            <Space>
              <Text type="secondary">Total Work Value:</Text>
              <Text strong>₹ {totalAmount.toLocaleString('en-IN')}</Text>
            </Space>
          </Col>
          <Col span={12}>
            <Space>
              <Text type="secondary">EMD Amount:</Text>
              <Text strong>₹ {(value.amount || 0).toLocaleString('en-IN')}</Text>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EMDDetailsForm;