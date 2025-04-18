// src/features/items/pages/ItemsPage.tsx
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import {  ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ItemList } from '../components/ItemList';
import { ItemDetail } from '../components/ItemDetail';
import { ItemForm } from '../components/ItemForm';
import { useItems } from '../hooks/use-items';
import { useToast } from '../../../hooks/use-toast-app';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import type { Item, ItemFormData } from '../types/item';

export function ItemsPage() {
  return (
    <Routes>
      <Route path="/" element={<ItemsList />} />
      <Route path="/new" element={<CreateItemPage />} />
      <Route path="/:id" element={<ItemDetail />} />
      <Route path="/:id/edit" element={<EditItemPage />} />
      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
}

function ItemsList() {
  // const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Items</h1>
      </div>
      <ItemList />
    </div>
  );
}

function CreateItemPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createItem } = useItems();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (data: ItemFormData) => {
    try {
      setIsLoading(true);
      await createItem(data);
      showSuccess("Item created successfully");
      navigate("/items");
    } catch (error) {
      showError("Failed to create item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/items")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
        <h2 className="text-2xl font-bold">Create New Item</h2>
      </div>

      <ItemForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        mode="create" 
      />
    </div>
  );
}

function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const { getItem, updateItem } = useItems();
  const { showSuccess, showError } = useToast();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!id || fetchedRef.current) return;

    async function loadItem() {
      try {
        setIsLoading(true);
        
        if (id) {
          const data = await getItem(id);
          if (data) {
            setItem(data);
            fetchedRef.current = true;
          }
        }
      } catch (error) {
        console.error('Failed to fetch item:', error);
        showError("Failed to fetch item details");
      } finally {
        setIsLoading(false);
      }
    }

    loadItem();

    return () => {
      fetchedRef.current = false;
    };
  }, [id]);

  const handleSubmit = async (data: ItemFormData) => {
    if (!id) return;
    try {
      setIsSaving(true);
      await updateItem(id, data);
      showSuccess("Item updated successfully");
      navigate("/items");
    } catch (error) {
      showError("Failed to update item");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!item) return <Alert variant="destructive"><AlertDescription>Item not found</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/items")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
        <h2 className="text-2xl font-bold">Edit Item</h2>
      </div>

      <ItemForm
        initialData={item}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        mode="edit"
      />
    </div>
  );
}