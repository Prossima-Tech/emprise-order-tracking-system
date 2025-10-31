import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FDRList } from '../components/FDRList';
import { FDRForm } from '../components/FDRForm';
import { FDRDetail } from '../components/FDRDetail';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { useFDRs } from '../hooks/use-fdrs';
import { FDRFormData } from '../types/fdr';

export function FDRsPage() {
  return (
    <Routes>
      <Route index element={<FDRsList />} />
      <Route path="new" element={<NewFDR />} />
      <Route path=":id" element={<FDRDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
}

function FDRsList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">FDR Management</h1>
      </div>
      <FDRList />
    </div>
  );
}

function NewFDR() {
  const navigate = useNavigate();
  const { createFDR } = useFDRs();

  const handleSubmit = async (data: FDRFormData) => {
    try {
      await createFDR(data);
      navigate('..');
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error creating FDR:', error);
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
        <h1 className="text-2xl font-bold">Create New FDR</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <FDRForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('..')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
