import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Edit, FileText, ArrowDownToLine, RefreshCcw, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { useTenders } from '../hooks/use-tenders';
import { Tender, TenderStatus } from '../types/tender';
import { LoadingSpinner } from '../../../components/feedback/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Label } from '../../../components/ui/label';

export function TenderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TenderStatus | ''>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const { getTenderById, updateTenderStatus } = useTenders();

  useEffect(() => {
    let isMounted = true;
    
    const fetchTender = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getTenderById(id);
        if (isMounted) {
          setTender(data);
          setSelectedStatus(data.status);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge>Active</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">Closed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'AWARDED':
        return <Badge variant="outline">Awarded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !tender || !selectedStatus || selectedStatus === tender.status) {
      setIsStatusDialogOpen(false);
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const updatedTender = await updateTenderStatus(id, selectedStatus);
      setTender(updatedTender);
      setIsStatusDialogOpen(false);
    } catch (error) {
      console.error('Failed to update tender status', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!tender) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Tender not found</h2>
        <Button onClick={() => navigate('/tenders')}>Back to Tenders</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{tender.tenderNumber} | Emprise Order Tracking</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/tenders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenders
            </Button>
            <h1 className="text-2xl font-bold">{tender.tenderNumber}</h1>
            {getStatusBadge(tender.status)}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(true)}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Update Status
            </Button>
            <Button onClick={() => navigate(`/tenders/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Tender
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tender Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p className="font-medium">{format(new Date(tender.dueDate), 'PPP')}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div>{getStatusBadge(tender.status)}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="whitespace-pre-wrap">{tender.description}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">EMD Details</h3>
                <p>
                  {tender.hasEMD 
                    ? `EMD Required: ₹${tender.emdAmount?.toLocaleString() || '0'}`
                    : 'No EMD required for this tender'}
                </p>
              </div>

              {tender.documentUrl && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>
                    <div className="flex gap-4">
                      <a 
                        href={tender.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Tender Document
                      </a>
                      <a 
                        href={tender.documentUrl} 
                        download
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Created On</h3>
                  <p className="font-medium">{format(new Date(tender.createdAt), 'PPP')}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p className="font-medium">{format(new Date(tender.updatedAt), 'PPP')}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tender.tags.length > 0 ? (
                    tender.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No tags</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tender Status</DialogTitle>
            <DialogDescription>
              Change the status of tender {tender.tenderNumber}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as TenderStatus)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="AWARDED">Awarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus || selectedStatus === tender.status}>
              {isUpdatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 