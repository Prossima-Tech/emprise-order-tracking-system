import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { OfferList } from '../components/OfferList';
import { OfferForm } from '../components/OfferForm';
import { OfferDetail } from '../components/OfferDetail';
import { Card, CardContent } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast-app';
import { useOffers } from '../hooks/use-offers';
import { Offer, OfferFormData } from '../types/Offer';
import { Button } from '../../../components/ui/button';
import { ArrowLeft} from 'lucide-react';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';

export function OffersPage() {
  return (
    <Routes>
      <Route index element={<OffersList />} />
      <Route path="new" element={<NewOffer />} />
      <Route path=":id" element={<OfferDetail />} />
      <Route path=":id/edit" element={<EditOffer />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
}

// Component for the offers list view
function OffersList() {
  // const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Budgetary Offers</h1>
        {/* <Button onClick={() => navigate('new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button> */}
      </div>
      <OfferList />
    </div>
  );
}

// Component for creating a new offer
function NewOffer() {
  const navigate = useNavigate();
  const { createOffer } = useOffers();
  const { showSuccess } = useToast();

  const handleSubmit = async (data: OfferFormData) => {
    try {
      await createOffer(data);
      showSuccess('Offer created successfully');
      navigate('..');
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error creating offer:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('..')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Offer</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <OfferForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('..')}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Component for editing an existing offer
function EditOffer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateOffer, getOffer } = useOffers();
  const { showSuccess, showError } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple useEffect without useCallback
  useEffect(() => {
    let mounted = true;

    const fetchOffer = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getOffer(id);
        if (mounted) {
          // Transform dates to Date objects
          const offerData = {
            ...response,
            offerDate: response.offerDate ? new Date(response.offerDate) : null,
            createdAt: response.createdAt ? new Date(response.createdAt) : null,
            updatedAt: response.updatedAt ? new Date(response.updatedAt) : null,
          };
          setOffer(offerData);
        }
      } catch (error) {
        if (mounted) {
          showError('Failed to fetch offer details');
          navigate('..');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOffer();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [id]); // Only depend on id

  const handleSubmit = async (data: OfferFormData) => {
    try {
      await updateOffer(id!, data);
      showSuccess('Offer updated successfully');
      navigate('..');
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!offer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('..')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Offer</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <OfferForm
            key={offer.id}
            initialData={offer}
            onSubmit={handleSubmit}
            onCancel={() => navigate('..')}
          />
        </CardContent>
      </Card>
    </div>
  );
}