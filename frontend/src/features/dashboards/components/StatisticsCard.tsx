import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import type { StatisticCard } from "../types/dashboard";
import { motion } from "framer-motion";
import '../dashboard.css';

export function StatisticsCard({ title, value, description, trend, icon: Icon }: StatisticCard) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="stats-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <motion.div 
            className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="h-5 w-5 text-primary" />
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {trend && (
                <div className={`flex items-center text-sm font-medium ${
                  trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {trend.direction === 'up' ? '↑' : '↓'}
                  </motion.span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {description}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}