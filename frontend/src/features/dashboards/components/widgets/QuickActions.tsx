import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { FileText, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../../dashboard.css';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "New Offer",
      icon: FileText,
      onClick: () => navigate('/budgetary-offers/new'),
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      label: "New Site",
      icon: FileCheck,
      onClick: () => navigate('/sites/new'),
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/40"
    },
  
    {
      label: "New LOA",
      icon: FileCheck,
      onClick: () => navigate('/loas/new'),
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      label: "New PO",
      icon: FileCheck,
      onClick: () => navigate('/purchase-orders/new'),
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/40"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    
    <Card className="stats-card elevation-2 border-none shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid gap-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {actions.map((action, index) => (
            <motion.div key={index} variants={item}>
              <Button
                variant="outline"
                className={`w-full justify-start h-12 relative group overflow-hidden border-border/50 hover:border-primary/50 ${action.bgColor}`}
                onClick={action.onClick}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <div className={`rounded-full ${action.bgColor} p-2 mr-3`}>
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <span className="font-medium">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}