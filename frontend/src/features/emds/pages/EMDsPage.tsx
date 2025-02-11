import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { EMDList } from '../components/EMDList';
import { EMDForm } from '../components/EMDForm';
import { EMDDetail } from '../components/EMDDetail';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { useEMDs } from '../hooks/use-emds';
import { EMDFormData } from '../types/emd';
    
export function EMDsPage() {
  return (
    <Routes>
      <Route index element={<EMDsList />} />
      <Route path="new" element={<NewEMD />} />
      <Route path=":id" element={<EMDDetail />} />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
}

function EMDsList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">EMDs Management</h1>
      </div>
      <EMDList />
    </div>
  );
}

function NewEMD() {
  const navigate = useNavigate();
  const { createEMD } = useEMDs();

  const handleSubmit = async (data: EMDFormData) => {
    try {
      await createEMD(data);
      navigate('..');
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error creating EMD:', error);
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
        <h1 className="text-2xl font-bold">Create New EMD</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EMDForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('..')}
          />
        </CardContent>
      </Card>
    </div>
  );
}