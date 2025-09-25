'use client';

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import UserCheck from '../../../public/icon/user-check';

export const description = 'A radial chart with text';

const chartData = [
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
];

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  safari: {
    label: 'Safari',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function ChartRadialText() {
  return (
    <Card className="h-full p-2">
      <CardHeader className="flex justify-between items-center pb-0 px-0">
        <CardTitle>Active Agents</CardTitle>
        <div>
          <div className="w-6.5 h-6.5 p-1.5 gap-1.5 rounded-lg bg-primary-brand-green flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5 stroke-primary-brand-darker-green" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pb-0 my-auto px-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-40}
            innerRadius={80}
            outerRadius={100}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar
              dataKey="visitors"
              background
              cornerRadius={10}
              style={{ fill: '#199E78' }}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan className="!fill-[#272727] text-[28px] font-medium leading-8">
                          3
                        </tspan>
                        <tspan
                          className="!fill-[#272727]/50 text-sm leading-9 font-medium"
                          dx="4"
                        >
                          /10
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="!fill-[#272727]/50 text-[10px] font-medium"
                        >
                          In-Active Agents
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm px-0">
        <div className="text-muted-foreground leading-none">
          Updated 5 minutes ago
        </div>
      </CardFooter>
    </Card>
  );
}
