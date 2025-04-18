import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Edit,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { LoadingSpinner } from "../../../components/feedback/LoadingSpinner";
import { useSites } from "../hooks/use-sites";
import { Site } from "../types/site";
import { StatusBadge } from "../../../components/data-display/StatusBadge";
import { DataTable } from "../../../components/data-display/DataTable";
import { PurchaseOrder } from "../../purchase-orders/types/purchase-order";
import { LOA } from "../../loas/types/loa";
import { EyeIcon } from "lucide-react";
import { useCustomers, Customer } from "../../customers/hooks/use-customers";

export function SiteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const { getSiteDetails, getSiteLoas, getSitePurchaseOrders } = useSites();
  const { getCustomer } = useCustomers();
  const [activeTab, setActiveTab] = useState("overview");
  const [loas, setLoas] = useState<LOA[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [railwayZone, setRailwayZone] = useState<Customer | null>(null);
  const [loadingZone, setLoadingZone] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [id]);

  useEffect(() => {
    if (site?.zoneId) {
      fetchRailwayZone(site.zoneId);
    }
  }, [site]);

  const fetchRailwayZone = async (zoneId: string) => {
    try {
      setLoadingZone(true);
      const zone = await getCustomer(zoneId);
      setRailwayZone(zone);
    } catch (error) {
      console.error("Error fetching railway zone:", error);
    } finally {
      setLoadingZone(false);
    }
  };

  const fetchAllData = async () => {
    try {
      if (!id) return;
      setLoading(true);
      
      const [siteResponse, loasResponse, posResponse] = await Promise.all([
        getSiteDetails(id),
        getSiteLoas(id),
        getSitePurchaseOrders(id)
      ]);

      setSite(siteResponse);
      setLoas(loasResponse);
      setPurchaseOrders(posResponse);
    } catch (error) {
      console.error("Error fetching site data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!site) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Site not found</h2>
        <Button onClick={() => navigate("/sites")} variant="link">
          Back to Sites
        </Button>
      </div>
    );
  }

  const loaColumns = [
    {
      header: "LOA Number",
      accessor: (row: LOA) => row.loaNumber,
    },
    {
      header: "Description",
      accessor: (row: LOA) => row.workDescription,
    },
    {
      header: "Value",
      accessor: (row: LOA) => (
        <span>₹{row.loaValue.toLocaleString()}</span>
      ),
    },
    {
      header: "Purchase Orders",
      accessor: (row: LOA) => (
        <span>{row.purchaseOrders?.length || 0} POs</span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: LOA) => (
        // TODO: Add view button using icon button
        <Button
          variant="ghost"
          onClick={() => navigate(`/loas/${row.id}`)}
        >
          <EyeIcon className="h-4 w-4 mr-2" />
        </Button>
      ),
    },
  ];
  
  const poColumns = [
    {
      header: "PO Number",
      accessor: (row: PurchaseOrder) => row.poNumber,
    },
    {
      header: "Vendor",
      accessor: (row: PurchaseOrder) => row.vendor.name,
    },
    {
      header: "Amount",
      accessor: (row: PurchaseOrder) => (
        <span>₹{row.totalAmount.toLocaleString()}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row: PurchaseOrder) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: "Actions",
      accessor: (row: PurchaseOrder) => (
        <Button
          variant="ghost"
          onClick={() => navigate(`/purchase-orders/${row.id}`)}
        >
          <EyeIcon className="h-4 w-4 mr-2" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/sites")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Button>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <StatusBadge status={site.status} />
        </div>
        <Button onClick={() => navigate(`/sites/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Site
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loas">LOAs</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Site Code
                </label>
                <p className="font-medium">{site.code}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Customer
                </label>
                <p className="font-medium">
                  {loadingZone ? (
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  ) : railwayZone ? (
                    `${railwayZone.name} (${railwayZone.id})`
                  ) : (
                    site.zoneId
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Location
                </label>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {site.location}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p>{site.address}</p>
              </div>
              {site.contactPerson && (
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Contact Information
                  </label>
                  <div className="space-y-1">
                    <p className="font-medium">{site.contactPerson}</p>
                    {site.contactPhone && (
                      <p className="flex items-center text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        {site.contactPhone}
                      </p>
                    )}
                    {site.contactEmail && (
                      <p className="flex items-center text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        {site.contactEmail}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total LOAs</p>
                <p className="text-2xl font-bold">{site.stats?.totalLoas || 0}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total POs</p>
                <p className="text-2xl font-bold">
                  {site.stats?.totalPurchaseOrders || 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ₹{(site.stats?.totalValue || 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loas">
          <Card>
            <CardHeader>
              <CardTitle>Letter of Acceptance</CardTitle>
              <CardDescription>
                All LOAs associated with this site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={loaColumns}
                data={loas}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-orders">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                All purchase orders associated with this site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={poColumns}
                data={purchaseOrders}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 