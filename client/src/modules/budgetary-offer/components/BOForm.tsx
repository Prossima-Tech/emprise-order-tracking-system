import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Space,
    message,
    Typography,
    Steps,
    Row,
    Col,
    Divider,
    Alert,
    DatePicker,
    Upload,
    Tooltip
} from 'antd';
import {
    SaveOutlined,
    UploadOutlined,
    InfoCircleOutlined,
    FileTextOutlined,
    ToolOutlined,
    SafetyCertificateOutlined,

    FileDoneOutlined
} from '@ant-design/icons';
import { WorkItemsTable } from './WorkItemsTable';
import { EMDDetailsForm } from './EMDDetailsForm';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Text } = Typography;

interface BOFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

export const BOForm: React.FC<BOFormProps> = ({
    initialValues,
    onSubmit,
    loading
}) => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    // Calculate EMD amount whenever total amount changes
    useEffect(() => {
        const emdPercentage = form.getFieldValue(['emdDetails', 'percentage']) || 2;
        form.setFieldsValue({
            emdDetails: {
                ...form.getFieldValue('emdDetails'),
                amount: (totalAmount * emdPercentage) / 100
            }
        });
    }, [totalAmount]);

    const steps = [
        {
            title: 'Basic Details',
            icon: <FileTextOutlined />,
            content: (
                <Card title="Basic Information" className="shadow-sm rounded-lg" bordered={false}>
                    {/* <Alert
                        message="Fill in the basic details of your budgetary offer"
                        description="Ensure all mandatory fields are filled with accurate information."
                        type="info"
                        showIcon
                        className="mb-6"
                    /> */}

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="referenceNo"
                                label={
                                    <Space>
                                        Reference Number
                                        <Tooltip title="Unique identifier for this offer">
                                            <InfoCircleOutlined className="text-gray-400" />
                                        </Tooltip>
                                    </Space>
                                }
                                rules={[
                                    { required: true, message: 'Please enter reference number' },
                                    { min: 3, message: 'Reference number must be at least 3 characters' }
                                ]}
                            >
                                <Input placeholder="Enter reference number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Offer Date"
                                rules={[{ required: true, message: 'Please select offer date' }]}
                            >
                                <DatePicker className="w-full" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fromAuthority"
                                label="From Authority"
                                rules={[
                                    { required: true, message: 'Please enter from authority' },
                                    { min: 3, message: 'Authority name must be at least 3 characters' }
                                ]}
                            >
                                <Input placeholder="Enter authority name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="toAuthority"
                                label="To Authority"
                                rules={[
                                    { required: true, message: 'Please enter to authority' },
                                    { min: 3, message: 'Authority name must be at least 3 characters' }
                                ]}
                            >
                                <Input placeholder="Enter receiving authority" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[
                            { required: true, message: 'Please enter subject' },
                            { min: 10, message: 'Subject must be at least 10 characters' }
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter a descriptive subject for the offer"
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>

                    {/* <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <ReactQuill
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ]
              }}
            />
          </Form.Item> */}
                </Card>
            )
        },
        {
            title: 'Work Items',
            icon: <ToolOutlined />,
            content: (
                <Card title="Work Items Details" className="shadow-sm rounded-lg" bordered={false}>
                    {/* <Alert
                        message="Add Work Items"
                        description="List all work items with their rates and tax details. The total value will be calculated automatically."
                        type="info"
                        showIcon
                        className="mb-6"
                    /> */}
                    <Form.Item
                        name="workItems"
                        rules={[{ required: true, message: 'Please add at least one work item' }]}
                    >
                        <WorkItemsTable onTotalChange={setTotalAmount} />
                    </Form.Item>

                    <Divider />

                    <div className="flex justify-end">
                        <div className="text-right">
                            <Text type="secondary">Total Amount</Text>
                            <div className="text-2xl font-semibold">
                                ₹ {totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </Card>
            )
        },
        {
            title: 'EMD Details',
            icon: <SafetyCertificateOutlined />,
            content: (
                <Card title="EMD Details" className="shadow-sm rounded-lg" bordered={false}>
                    {/* <Alert
                        message="EMD Information"
                        description="Fill in the Earnest Money Deposit details. The amount will be calculated based on the total work items value."
                        type="info"
                        showIcon
                        className="mb-6"
                    /> */}
                    <Form.Item
                        name="emdDetails"
                        rules={[{ required: true, message: 'Please fill EMD details' }]}
                    >
                        <EMDDetailsForm totalAmount={totalAmount} />
                    </Form.Item>
                </Card>
            )
        },
        {
            title: 'Terms & Conditions',
            icon: <FileDoneOutlined />,
            content: (
                <Card title="Terms and Conditions" className="shadow-sm rounded-lg" bordered={false}>
                    {/* <Alert
                        message="Important Notice"
                        description="Carefully specify all terms and conditions. These will be included in the final offer document."
                        type="warning"
                        showIcon
                        className="mb-6"
                    /> */}
                    <Form.Item
                        name="termsAndConditions"
                        rules={[
                            { required: true, message: 'Please enter terms and conditions' },
                            { min: 100, message: 'Terms must be at least 100 characters' }
                        ]}
                    >
                        <ReactQuill
                            theme="snow"
                            modules={{
                                toolbar: [
                                    [{ 'header': [1, 2, 3, false] }],
                                    ['bold', 'italic', 'underline'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    ['link', 'blockquote'],
                                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                                    ['clean']
                                ]
                            }}
                            className="h-64"
                        />
                    </Form.Item>

                    <div>
                        <Form.Item
                            name="attachments"
                            label="  "

                        >
                            <Upload
                                action="/api/upload"
                                listType="text"
                                maxCount={5}
                            >
                                <Button icon={<UploadOutlined />}>Upload Document</Button>
                            </Upload>
                        </Form.Item>
                    </div>
                </Card>
            )
        }
    ];

    const handleSubmit = async (values: any) => {
        if (!values.workItems || values.workItems.length === 0) {
            message.error('Please add at least one work item');
            return;
        }

        try {
            setSubmitting(true);
            await onSubmit(values);
        } finally {
            setSubmitting(false);
        }
    };

    const getFieldsForCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return ['referenceNo', 'date', 'fromAuthority', 'toAuthority', 'subject', 'description'];
            case 1:
                return ['workItems'];
            case 2:
                return ['emdDetails'];
            case 3:
                return ['termsAndConditions'];
            default:
                return [];
        }
    };

    const next = async () => {
        try {
            await form.validateFields(getFieldsForCurrentStep());
            setCurrentStep(currentStep + 1);
        } catch (error) {
            message.error('Please fill all required fields correctly');
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <div className=" mx-auto">
            {/* Steps Progress */}
            {/* <Card className="mb-6 shadow-sm rounded-lg" bordered={false}>
        <Steps
          current={currentStep}
          items={steps.map((step) => ({
            title: step.title,
            icon: step.icon
          }))}
        />
      </Card> */}

            {/* Main Form */}
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={handleSubmit}
                onValuesChange={() => setFormTouched(true)}
            >
                {/* Dynamic Step Content */}
                <div className="mb-6">
                    {steps[currentStep].content}
                </div>

                {/* Form Navigation */}
                <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <Space>
                            {/* Back Button */}
                            <Button
                                onClick={prev}
                                disabled={currentStep === 0}
                                className="min-w-[100px]"
                            >
                                Previous
                            </Button>

                            {/* Reset Button - Only show if form is touched */}
                            {formTouched && (
                                <Button
                                    danger
                                    onClick={() => {
                                        form.resetFields();
                                        setFormTouched(false);
                                    }}
                                    disabled={loading || submitting}
                                >
                                    Reset Form
                                </Button>
                            )}
                        </Space>

                        <Space size="middle">
                            {/* Save as Draft Button */}
                            <Button
                                type="default"
                                icon={<SaveOutlined />}
                                onClick={() => {
                                    form.validateFields().then(values => {
                                        onSubmit({ ...values, status: 'DRAFT' });
                                    });
                                }}
                                loading={loading || submitting}
                                className="min-w-[140px]"
                            >
                                Save Draft
                            </Button>

                            {/* Next/Submit Button */}
                            {currentStep < steps.length - 1 ? (
                                <Button
                                    type="primary"
                                    onClick={next}
                                    className="min-w-[100px]"
                                >
                                    Next Step
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    onClick={() => form.submit()}
                                    loading={loading || submitting}
                                    icon={<FileDoneOutlined />}
                                    className="min-w-[140px]"
                                >
                                    Submit Offer
                                </Button>
                            )}
                        </Space>
                    </div>
                </div>
            </Form>

            {/* Progress Indicator */}
            <Card
                className=" bg-gray-50"
                bordered={false}
            >
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                        Step {currentStep + 1} of {steps.length}
                    </div>
                    <div>
                        {steps[currentStep].title}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default BOForm;