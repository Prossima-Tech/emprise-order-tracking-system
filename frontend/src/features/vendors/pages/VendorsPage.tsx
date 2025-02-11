// src/features/vendors/pages/VendorsPage.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { VendorList } from '../components/VendorList';
import { VendorDetail } from '../components/VendorDetail';
import { VendorForm } from '../components/VendorForm';
import { VendorItemManagement } from '../components/VendorItemManagement';
// Main container component for vendor management
export function VendorsPage() {
  return (
    <Routes>
      <Route index element={<VendorsList />} />
      <Route path="new" element={<VendorForm />} />
      <Route path=":id" element={<VendorDetail />} />
      <Route path=":id/edit" element={<VendorForm />} />
      <Route path=":id/items" element={<VendorItemManagement />} />
      <Route path="*" element={<Navigate to="/vendors" />} />
    </Routes>
  );
}

// Component for displaying the main vendors listing
function VendorsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendor Management</h1>
      </div>
      <VendorList />
    </div>
  );
}

// Component for creating a new vendor
// function NewVendor() {
//   const navigate = useNavigate();
//   const { createVendor } = useVendors();
//   const { showSuccess } = useToast();

//   const handleSubmit = async (data: VendorFormData) => {
//     try {
//       await createVendor(data);
//       showSuccess('Vendor created successfully');
//       navigate('/vendors');
//     } catch (error) {
//       // Error handling is done in the hook
//       console.error('Error creating vendor:', error);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center">
//         <Button variant="ghost" onClick={() => navigate('/vendors')} className="mr-4">
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
//         <h1 className="text-2xl font-bold">Register New Vendor</h1>
//       </div>

//       <Card>
//         <CardContent className="pt-6">
//           <VendorForm
//             onSubmit={handleSubmit}
//             onCancel={() => navigate('/vendors')}
//           />
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // Component for editing an existing vendor
// function EditVendor() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const { updateVendor } = useVendors();
//   const { showSuccess, showError } = useToast();
//   const [vendor, setVendor] = useState<Vendor | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch vendor details when the component mounts
//   useEffect(() => {
//     const fetchVendor = async () => {
//       try {
//         setLoading(true);
//         const response = await apiClient.get(`/vendors/${id}`);
//         setVendor(response.data);
//       } catch (error) {
//         showError('Failed to fetch vendor details');
//         navigate('/vendors');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchVendor();
//     }
//   }, [id, navigate]);

//   const handleSubmit = async (data: VendorFormData) => {
//     try {
//       await updateVendor(id!, data);
//       showSuccess('Vendor updated successfully');
//       navigate('/vendors');
//     } catch (error) {
//       // Error handling is done in the hook
//       console.error('Error updating vendor:', error);
//     }
//   };

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (!vendor) {
//     return null;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center">
//         <Button variant="ghost" onClick={() => navigate('/vendors')} className="mr-4">
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
//         <h1 className="text-2xl font-bold">Edit Vendor</h1>
//       </div>
//       <Card>
//         <CardContent className="pt-6">
//           <VendorForm
//             onSubmit={handleSubmit}
//             onCancel={() => navigate('/vendors')}
//           />
//         </CardContent>
//       </Card>
//     </div>
//   );
// }