'use client';

import { MessageSquare } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const description = 'A linear line chart';

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
];
const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function ChartLineLinear() {
  return (
    <Card className="h-full flex flex-col p-2">
      <CardHeader className="flex items-center justify-between pb-0 px-0">
        <div>
          <CardTitle className="text-[#272727] text-body-b2">120</CardTitle>
          <CardDescription className="text-sm font-normal leading-3.5 text-[#272727]/50">
            Total Chats
          </CardDescription>
        </div>
        <div className="flex gap-1 items-center">
          <Select defaultValue="week">
            <SelectTrigger className="w-full !h-6.5">
              <SelectValue placeholder="Select time" className="!h-6.5" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-6.5 h-6.5 p-1.5 gap-1.5 rounded-lg bg-primary-brand-green flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 stroke-primary-brand-darker-green" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="desktop"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
