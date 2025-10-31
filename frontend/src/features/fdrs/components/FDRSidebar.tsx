import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import type { FDR } from "../types/fdr";

interface FDRSidebarProps {
  fdr: FDR;
}

export function FDRSidebar({ fdr }: FDRSidebarProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <Badge>{fdr.category}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bank</p>
            <p className="font-medium">{fdr.bankName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={fdr.status === 'RUNNING' ? 'default' : 'secondary'}>
              {fdr.status}
            </Badge>
          </div>
          {fdr.location && (
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-sm">{fdr.location}</p>
            </div>
          )}
          {fdr.poc && (
            <div>
              <p className="text-sm text-muted-foreground">POC</p>
              <p className="text-sm">{fdr.poc}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {fdr.tags && fdr.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fdr.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
