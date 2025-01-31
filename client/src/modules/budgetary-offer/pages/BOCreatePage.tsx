// src/pages/BOCreatePage.tsx

import React, { useState, useEffect } from 'react';
import { Card, Form, Button, message, Divider, UploadFile } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import {
  BasicInfoForm,
  WorkItemsForm,
  EMDDetailsForm,
  ApprovalChainForm,
  TermsConditionsForm
} from '../components/create';
import { BOService } from '../services/BOService';
import { 
  BudgetaryOfferCreateInput, 
  BudgetaryOfferStatus,
  ApprovalLevel,
  WorkItem 
} from '../types/BudgetaryOffer';
import { useAuth } from '../../../hooks/useAuth';
import moment from 'moment';

interface FormValues {
  subject: string;
  offerDate: moment.Moment;
  fromAuthority: string;
  toAuthority: string;
  workItems: WorkItem[];
  emdDetails: {
    amount: number;
    submissionDate: moment.Moment;
    bankName: string;
    paymentMode: string;
  };
  approvers: string[];
  termsAndConditions: string;
}

export const BOCreatePage: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { user } = useAuth();

  // Watch work items for EMD validation
  const workItems = Form.useWatch('workItems', form);

  useEffect(() => {
    if (workItems?.length) {
      validateEMDAmount();
    }
  }, [workItems]);

  const validateEMDAmount = () => {
    const emdAmount = form.getFieldValue(['emdDetails', 'amount']);
    if (!emdAmount) return;

    const { maxEMD } = BOService.calculateWorkItemTotals(workItems || []);
    if (emdAmount > maxEMD) {
      form.setFields([{
        name: ['emdDetails', 'amount'],
        errors: [`EMD amount cannot exceed ₹${maxEMD.toFixed(2)} (5% of total value)`]
      }]);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Generate offer ID
      const offerId = `BO-${moment().format('YYMMDD')}`;

      // Create approval levels
      const approvalLevels: ApprovalLevel[] = values.approvers.map((approverId, index) => ({
        level: index + 1,
        approverId,
        status: index === 0 ? 'PENDING' : undefined
      }));

      // Prepare input data
      const data: BudgetaryOfferCreateInput = {
        offerId,
        offerDate: values.offerDate.toDate(),
        fromAuthority: values.fromAuthority.trim(),
        toAuthority: values.toAuthority.trim(),
        status: BudgetaryOfferStatus.DRAFT,
        subject: values.subject.trim(),
        workItems: values.workItems.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitOfMeasurement: item.unitOfMeasurement.trim(),
          baseRate: Number(item.baseRate),
          taxRate: Number(item.taxRate)
        })),
        emdDetails: {
          amount: Number(values.emdDetails.amount),
          submissionDate: values.emdDetails.submissionDate.toDate(),
          bankName: 'IDBI',
          paymentMode: 'FDR'
        },
        termsAndConditions: {
          html: values.termsAndConditions,
          plainText: values.termsAndConditions.replace(/<[^>]*>/g, '').trim()
        },
        currentApprovalLevel: values.approvers.length > 0 ? 1 : undefined,
        approvalLevels,
        approvers: values.approvers,
        createdById: user?.id || ''
      };

      // Validate EMD amount
      if (!BOService.validateEMDAmount(data.workItems, data.emdDetails.amount)) {
        throw new Error('EMD amount exceeds 5% of total project value');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));

      if (fileList[0]?.originFileObj) {
        formData.append('emdDocument', fileList[0].originFileObj);
      }

      const createdOffer = await BOService.createOffer(formData);

      message.success('Budgetary offer created successfully');
      navigate(`/budgetary-offers/${createdOffer.id}`);
    } catch (error: any) {
      if (error.response?.data?.details) {
        error.response.data.details.forEach((err: any) => {
          message.error(err.message);
        });
      } else {
        message.error(error.message || 'Failed to create budgetary offer');
      }
      console.error('Error creating offer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <PageHeader
          title="Create Budgetary Offer"
          actions={[
            <Button key="cancel" onClick={() => navigate('/budgetary-offers')}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
            >
              Create Offer
            </Button>
          ]}
        />

        <Form<FormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            offerDate: moment(),
            workItems: [{}],
            emdDetails: {
              bankName: 'IDBI',
              paymentMode: 'FDR'
            },
            approvers: ['']
          }}
        >
          <BasicInfoForm form={form} />
          <Divider />

          <WorkItemsForm form={form} />
          <Divider />

          <EMDDetailsForm
            form={form}
            fileList={fileList}
            onFileChange={({ fileList }) => setFileList(fileList)}
          />
          <Divider />

          <TermsConditionsForm form={form} />
          <Divider />

          <ApprovalChainForm form={form}/>
        </Form>
      </Card>
    </div>
  );
};

export default BOCreatePage;