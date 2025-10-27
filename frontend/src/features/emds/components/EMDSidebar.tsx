import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { useEMDs } from '../hooks/use-emds';
import type { EMD } from '../types/emd';
import { Skeleton } from '../../../components/ui/skeleton';

interface EMDSidebarProps {
  tenderId?: string;
  onEMDClick?: (emdId: string) => void;
  className?: string;
}

export function EMDSidebar({ tenderId, onEMDClick, className }: EMDSidebarProps) {
  const [emds, setEmds] = useState<EMD[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { getAllEMDs, loading } = useEMDs();

  const fetchEMDs = async () => {
    try {
      setRefreshing(true);
      const data = await getAllEMDs();
      // Filter by tenderId if provided
      const filteredData = tenderId
        ? data.filter((emd: EMD) => emd.tenderId === tenderId)
        : data;
      setEmds(filteredData);
    } catch (error) {
      console.error('Failed to fetch EMDs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEMDs();
  }, [tenderId]);

  const getStatusIcon = (status: EMD['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'EXPIRED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'RELEASED':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: EMD['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'EXPIRED':
        return 'destructive';
      case 'RELEASED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isExpiringSoon = (maturityDate: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const stats = {
    total: emds.length,
    active: emds.filter(e => e.status === 'ACTIVE').length,
    expired: emds.filter(e => e.status === 'EXPIRED').length,
    expiringSoon: emds.filter(e => e.status === 'ACTIVE' && isExpiringSoon(e.maturityDate)).length,
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            EMD Tracker
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchEMDs}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Total EMDs</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Expired</p>
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          </div>
        </div>

        <Separator />

        {/* EMD List */}
        <div>
          <h3 className="text-sm font-medium mb-2">Recent EMDs</h3>

          {loading && !refreshing ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : emds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No EMDs found</p>
              {tenderId && (
                <p className="text-xs mt-1">No EMDs linked to this tender</p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {emds.map((emd) => (
                  <Card
                    key={emd.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onEMDClick?.(emd.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(emd.status)}
                          <div>
                            <p className="text-sm font-medium">
                              ₹{emd.amount.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {emd.bankName}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(emd.status)}>
                          {emd.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Submission:</span>
                          <span>{new Date(emd.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Maturity:</span>
                          <span className="flex items-center gap-1">
                            {new Date(emd.maturityDate).toLocaleDateString()}
                            {isExpiringSoon(emd.maturityDate) && emd.status === 'ACTIVE' && (
                              <AlertTriangle className="h-3 w-3 text-orange-600" />
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(emd.createdAt), { addSuffix: true })}
                        </div>
                      </div>

                      {emd.tags && emd.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {emd.tags.slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {emd.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{emd.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end mt-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
