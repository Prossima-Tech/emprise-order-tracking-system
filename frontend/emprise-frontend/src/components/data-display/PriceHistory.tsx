import { format } from "date-fns";
import { Card, CardContent } from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PriceHistoryProps {
  data: {
    currentPrice: number;
    priceHistory: Array<{
      purchaseDate: string;
      poNumber: string;
      quantity: number;
      unitPrice: number;
      totalAmount: number;
      status: string;
    }>;
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
  };
  vendorName: string; // Add vendor name prop
}

export function PriceHistory({ data, vendorName }: PriceHistoryProps) {
  const chartData = data.priceHistory.map(entry => ({
    date: format(new Date(entry.purchaseDate), "MMM d, yyyy"),
    price: entry.unitPrice,
    quantity: entry.quantity
  })).reverse(); // Reverse to show oldest to newest

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Current Price</div>
            <div className="text-2xl font-bold">₹{data.currentPrice}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Average Price</div>
            <div className="text-2xl font-bold">₹{data.averagePrice.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Lowest Price</div>
            <div className="text-2xl font-bold">₹{data.lowestPrice}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Highest Price</div>
            <div className="text-2xl font-bold">₹{data.highestPrice}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Quantity', angle: 90, position: 'insideRight' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  name="Unit Price"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="quantity"
                  stroke="#16a34a"
                  name="Quantity"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">PO Number</th>
                  <th className="p-2 text-left">Vendor</th>
                  <th className="p-2 text-right">Quantity</th>
                  <th className="p-2 text-right">Unit Price</th>
                  {/* <th className="p-2 text-right">Total</th> */}
                  <th className="p-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.priceHistory.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{format(new Date(entry.purchaseDate), "PP")}</td>
                    <td className="p-2">{entry.poNumber}</td>
                    <td className="p-2">{vendorName}</td>
                    <td className="p-2 text-right">{entry.quantity}</td>
                    <td className="p-2 text-right">₹{entry.unitPrice}</td>
                    {/* <td className="p-2 text-right">₹{entry.totalAmount}</td> */}
                    <td className="p-2 text-right">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 