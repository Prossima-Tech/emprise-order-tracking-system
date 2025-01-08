import React from 'react';
import { Form, Input, Button, Card, Space, message } from 'antd';
import { WorkItemsTable } from './WorkItemsTable';
import { EMDDetailsForm } from './EMDDetailsForm';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BOFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}


interface BOFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

export const BOForm: React.FC<BOFormProps> = ({ initialValues, onSubmit, loading }) => {
    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        if (!values.workItems || values.workItems.length === 0) {
            message.error('Please add at least one work item');
            return;
        }
        onSubmit(values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleSubmit}
            className="max-w-4xl mx-auto"
        >
            <Card title="Basic Details" className="mb-6">
                <Form.Item
                    name="fromAuthority"
                    label="From Authority"
                    rules={[{ required: true, message: 'Please enter from authority' }]}
                >
                    <Input placeholder="Enter authority name" />
                </Form.Item>

                <Form.Item
                    name="toAuthority"
                    label="To Authority"
                    rules={[{ required: true, message: 'Please enter to authority' }]}
                >
                    <Input placeholder="Enter receiving authority" />
                </Form.Item>

                <Form.Item
                    name="subject"
                    label="Subject"
                    rules={[{ required: true, message: 'Please enter subject' }]}
                >
                    <Input.TextArea rows={3} placeholder="Enter offer subject" />
                </Form.Item>
            </Card>

            <Card title="Work Items" className="mb-6">
                <Form.Item
                    name="workItems"
                    rules={[{ required: true, message: 'Please add at least one work item' }]}
                >
                    <WorkItemsTable />
                </Form.Item>
            </Card>

            <Card title="EMD Details" className="mb-6">
                <Form.Item
                    name="emdDetails"
                    rules={[{ required: true, message: 'Please fill EMD details' }]}
                >
                    <EMDDetailsForm />
                </Form.Item>
            </Card>

            <Card title="Terms and Conditions" className="mb-6">
                <Form.Item
                    name="termsAndConditions"
                    rules={[{ required: true, message: 'Please enter terms and conditions' }]}
                >
                    <ReactQuill
                        theme="snow"
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ]
                        }}
                    />
                </Form.Item>
            </Card>

            <div className="flex justify-end">
                <Space>
                    <Button onClick={() => form.resetFields()}>
                        Reset
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Submit
                    </Button>
                </Space>
            </div>
        </Form>
    );
};

export default BOForm;