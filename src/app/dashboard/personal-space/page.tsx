import { ChartLineLinear } from '@/components/chart/chart-line-linear';
import { ChartRadialText } from '@/components/chart/radial-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock3, Tag } from 'lucide-react';

export default function PersonalSpace() {
  return (
    <div className="h-full bg-background transition-colors duration-200">
      <div className="my-container">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-[#272727] text-body-b1">Personal Space</h2>
          <p className="text-sm text-[#272727]/60 mt-1">
            Manage your installed agents and workspace settings
          </p>
        </div>

        {/* Content Row - Flex layout */}
        <div className="flex gap-4 w-full items-stretch">
          {/* Left: Line chart large card */}
          <div className="flex-[1.6] min-w-0 w-[45%] h-[285px] [&>*]:h-full">
            <ChartLineLinear />
          </div>

          {/* Middle: Active Agents radial card */}
          <div className="w-[20%] shrink-0 h-[285px] [&>*]:h-full">
            <ChartRadialText />
          </div>

          {/* Right: Two stacked stat cards */}
          <div className="w-[30%] shrink-0 flex flex-col gap-4 h-[285px]">
            {/* Usage Time card */}
            <Card className="w-full h-full p-2 justify-between">
              <CardHeader className="flex items-center justify-between px-0">
                <Select defaultValue="week">
                  <SelectTrigger className="w-28 !h-6.5">
                    <SelectValue placeholder="This week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-6.5 h-6.5 p-1.5 rounded-lg bg-primary-brand-green flex items-center justify-center">
                  <Clock3 className="w-3.5 h-3.5 stroke-primary-brand-darker-green" />
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <CardTitle className="text-[#272727] text-body-b2">
                  12h20m
                </CardTitle>
                <p className="text-sm text-[#272727]/60 mt-1">Usage Time</p>
              </CardContent>
            </Card>

            {/* Top Category card */}
            <Card className="w-full h-full p-2 justify-between">
              <CardHeader className="flex items-center justify-between pb-0 px-0">
                <Select defaultValue="week">
                  <SelectTrigger className="w-28 !h-6.5">
                    <SelectValue placeholder="This week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-6.5 h-6.5 p-1.5 rounded-lg bg-primary-brand-green flex items-center justify-center">
                  <Tag className="w-3.5 h-3.5 text-foreground stroke-primary-brand-darker-green" />
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <CardTitle className="text-[#272727] text-xl font-medium">
                  Gaming
                </CardTitle>
                <p className="text-sm text-[#272727]/60 mt-1">Top Category</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
