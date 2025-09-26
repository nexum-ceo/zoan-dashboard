'use client';

import { Bot, Codesandbox, MessageSquare } from 'lucide-react';
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

const chartData = [
  { month: 'Mon', desktop: 0, date: '10/08/2025' },
  { month: 'Tue', desktop: 21, date: '11/08/2025' },
  { month: 'Wed', desktop: 24, date: '12/08/2025' },
  { month: 'Thu', desktop: 11, date: '13/08/2025' },
  { month: 'Fri', desktop: 24, date: '14/08/2025' },
  { month: 'Sat', desktop: 10, date: '15/08/2025' },
  { month: 'Sun', desktop: 14, date: '16/08/2025' },
];

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
  return (
    <Card className="h-full flex flex-col p-2">
      <CardHeader className="pb-0 px-0">
        <div className="flex items-center justify-between">
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
            data={chartData}
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
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12, fill: '#666' }}
              ticks={[0, 10, 20, 25, 50]}
              domain={[0, 50]}
            />
            <ChartTooltip
              cursor={{ stroke: 'rgba(0,0,0,0.06)' }}
              content={<CustomLineTooltip />}
            />
            <Line
              dataKey="desktop"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                r: 3,
                strokeWidth: 1.5,
                stroke: 'var(--color-desktop)',
                fill: '#fff',
              }}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: 'var(--color-desktop)',
                fill: '#fff',
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
