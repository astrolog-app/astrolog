import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const usageData = [
  { month: "Jan", hours: 12 },
  { month: "Feb", hours: 8 },
  { month: "Mar", hours: 15 },
  { month: "Apr", hours: 22 },
  { month: "May", hours: 18 },
  { month: "Jun", hours: 25 },
  { month: "Jul", hours: 32 },
  { month: "Aug", hours: 28 },
  { month: "Sep", hours: 20 },
  { month: "Oct", hours: 16 },
  { month: "Nov", hours: 10 },
  { month: "Dec", hours: 14 },
]

export function EquipmentMonthlyUsage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Usage</CardTitle>
        <CardDescription>Hours of telescope usage per month</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={usageData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: "#222", borderColor: "#444" }}
              itemStyle={{ color: "#fff" }}
              formatter={(value) => [`${value} hours`, "Usage"]}
            />
            <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}