import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { FileText, Wallet, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "New Offer",
      icon: FileText,
      onClick: () => navigate('/budgetary-offers/new')
    },
    {
      label: "New EMD",
      icon: Wallet,
      onClick: () => navigate('/emds/new')
    },
    {
      label: "New LOA",
      icon: FileCheck,
      onClick: () => navigate('/loas/new')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start"
            onClick={action.onClick}
          >
            <action.icon className="mr-2 h-3 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}