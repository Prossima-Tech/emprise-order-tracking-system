import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { TenderForm } from '../components/TenderForm';
import { useTenders } from '../hooks/use-tenders';
import { TenderFormData } from '../types/tender';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';

export function EditTenderPage() {
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<TenderFormData>>({});
  const navigate = useNavigate();
  const { updateTender, getTenderById } = useTenders();

  useEffect(() => {
    let isMounted = true;
    
    const fetchTender = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const tender = await getTenderById(id);
        
        if (isMounted) {
          setDefaultValues({
            tenderNumber: tender.tenderNumber,
            dueDate: new Date(tender.dueDate),
            description: tender.description,
            hasEMD: tender.hasEMD,
            emdAmount: tender.emdAmount !== undefined ? tender.emdAmount : null,
            tags: tender.tags || [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch tender', error);
        if (isMounted) {
          navigate('/tenders');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTender();
    
    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleSubmit = async (data: TenderFormData) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await updateTender(id, data);
      navigate('/tenders');
    } catch (error) {
      console.error('Failed to update tender', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>Edit Tender | Emprise Order Tracking</title>
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
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          title="Edit Tender"
          submitLabel="Update Tender"
        />
      </div>
    </>
  );
} 