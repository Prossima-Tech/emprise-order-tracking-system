import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { TenderForm, EMDData } from '../components/TenderForm';
import { useTenders } from '../hooks/use-tenders';
import { TenderFormData } from '../types/tender';
import { useEMDs } from '../../emds/hooks/use-emds';

export function CreateTenderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createTender } = useTenders();
  const { createEMD } = useEMDs();

  const handleSubmit = async (tenderData: TenderFormData, emdData?: EMDData) => {
    try {
      setIsSubmitting(true);

      // Step 1: Create the tender
      const createdTender = await createTender(tenderData);

      // Step 2: If EMD data exists, create EMD record linked to tender
      if (emdData && createdTender.id) {
        await createEMD({
          amount: emdData.amount,
          bankName: emdData.bankName,
          submissionDate: emdData.submissionDate,
          maturityDate: emdData.maturityDate,
          documentFile: emdData.documentFile,
          tenderId: createdTender.id, // Link to tender
          tags: emdData.tags
        });
      }

      navigate('/tenders');
    } catch (error) {
      console.error('Failed to create tender/EMD', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Tender | Emprise Order Tracking</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/tenders')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Tenders
          </button>
        </div>
        <TenderForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          title="Create New Tender"
          submitLabel="Create Tender"
        />
      </div>
    </>
  );
} 