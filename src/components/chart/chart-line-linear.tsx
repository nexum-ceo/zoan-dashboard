'use client';

import { Bot, Codesandbox, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

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
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const description = 'A linear line chart';

// Mock data for different time periods
const chartDataByPeriod = {
  week: [
    { month: 'Mon', desktop: 0, date: '10/08/2025' },
    { month: 'Tue', desktop: 21, date: '11/08/2025' },
    { month: 'Wed', desktop: 24, date: '12/08/2025' },
    { month: 'Thu', desktop: 11, date: '13/08/2025' },
    { month: 'Fri', desktop: 24, date: '14/08/2025' },
    { month: 'Sat', desktop: 10, date: '15/08/2025' },
    { month: 'Sun', desktop: 14, date: '16/08/2025' },
  ],
  month: [
    { month: 'Week 1', desktop: 45, date: '01/08/2025' },
    { month: 'Week 2', desktop: 52, date: '08/08/2025' },
    { month: 'Week 3', desktop: 38, date: '15/08/2025' },
    { month: 'Week 4', desktop: 61, date: '22/08/2025' },
  ],
  year: [
    { month: 'Jan', desktop: 120, date: '01/01/2025' },
    { month: 'Feb', desktop: 95, date: '01/02/2025' },
    { month: 'Mar', desktop: 140, date: '01/03/2025' },
    { month: 'Apr', desktop: 110, date: '01/04/2025' },
    { month: 'May', desktop: 160, date: '01/05/2025' },
    { month: 'Jun', desktop: 135, date: '01/06/2025' },
    { month: 'Jul', desktop: 180, date: '01/07/2025' },
    { month: 'Aug', desktop: 150, date: '01/08/2025' },
    { month: 'Sep', desktop: 200, date: '01/09/2025' },
    { month: 'Oct', desktop: 175, date: '01/10/2025' },
    { month: 'Nov', desktop: 220, date: '01/11/2025' },
    { month: 'Dec', desktop: 190, date: '01/12/2025' },
  ],
};

// Total counts for each period
const totalCounts = {
  week: 104,
  month: 196,
  year: 1865,
};

type LineTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; payload?: { date?: string } }>;
};

function CustomLineTooltip({ active, payload }: LineTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const value = item.value as number;
  const date = item?.payload?.date as string | undefined;
  return (
    <div className="rounded-lg bg-white shadow-sm border border-[#272727]/10 px-3 py-2">
      <div className="text-[#19a07b] text-sm font-semibold">{value} chats</div>
      {date ? (
        <div className="text-[10px] text-[#272727]/60 mt-0.5">{date}</div>
      ) : null}
    </div>
  );
}
const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function ChartLineLinear() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    'week' | 'month' | 'year'
  >('week');

  const currentData = chartDataByPeriod[selectedPeriod];
  const currentTotal = totalCounts[selectedPeriod];

  // Dynamic Y-axis configuration based on selected period
  const getYAxisConfig = () => {
    switch (selectedPeriod) {
      case 'week':
        return {
          ticks: [0, 10, 20, 25, 50],
          domain: [0, 50],
        };
      case 'month':
        return {
          ticks: [0, 20, 40, 60, 80],
          domain: [0, 80],
        };
      case 'year':
        return {
          ticks: [0, 50, 100, 150, 200, 250],
          domain: [0, 250],
        };
      default:
        return {
          ticks: [0, 10, 20, 25, 50],
          domain: [0, 50],
        };
    }
  };

  const yAxisConfig = getYAxisConfig();

  return (
    <Card className="h-full flex flex-col p-2">
      <CardHeader className="pb-0 px-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#272727] text-body-b2">
              {currentTotal}
            </CardTitle>
            <CardDescription className="text-sm font-normal leading-3.5 text-[#272727]/50">
              Total Chats
            </CardDescription>
          </div>

          <div className="flex gap-1 items-center">
            <Select
              value={selectedPeriod}
              onValueChange={(value: 'week' | 'month' | 'year') =>
                setSelectedPeriod(value)
              }
            >
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
        </div>
        <div>
          <Tabs defaultValue="discover" className="w-full bg-white">
            <TabsList className="bg-white border border-[#272727]/5">
              <TabsTrigger
                value="discover"
                className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
              >
                <Bot className="w-4 h-4" />
                Agent
              </TabsTrigger>
              <TabsTrigger
                value="2d"
                className="px-3 py-2 text-[#272727]  data-[state=active]:bg-primary-brand-green"
              >
                <Codesandbox className="w-4 h-4" />
                App
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={currentData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (selectedPeriod === 'week') {
                  return value.slice(0, 3);
                }
                return value;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: '#666' }}
              ticks={yAxisConfig.ticks}
              domain={yAxisConfig.domain}
            />
            <ChartTooltip
              cursor={{ stroke: 'rgba(0,0,0,0.06)' }}
              content={<CustomLineTooltip />}
            />
            <Line
              dataKey="desktop"
              type="linear"
              stroke="#199e78"
              strokeWidth={2}
              dot={{
                r: 3,
                strokeWidth: 1.5,
                stroke: '#939393',
                fill: '#fff',
              }}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: '#199e78',
                fill: '#fff',
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
