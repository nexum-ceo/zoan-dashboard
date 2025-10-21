'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemo } from 'react';

export default function ActivitySection() {
  const heatmap = useMemo(() => {
    return Array.from({ length: 53 * 7 }, (_, i) => {
      const value = (i * 13) % 10; // pseudo intensity 0-9
      return value;
    });
  }, []);

  const intensityToColor = (v: number) => {
    if (v === 0) return 'bg-[#e6f6ef]'; // very light
    if (v < 3) return 'bg-[#c8eedf]';
    if (v < 6) return 'bg-[#9de1c7]';
    if (v < 8) return 'bg-[#6ccfa9]';
    return 'bg-[#20a357]'; // primary-brand-darker-green
  };

  return (
    <section className="bg-white rounded-lg border border-[#272727]/10 p-2">
      <div className="flex items-center justify-between font-medium">
        <div className="text-[#272727] text-sm">
          Activity (
          <span className="text-primary-brand-darker-green">129 </span>
          messages in total)
        </div>
        <Select defaultValue="12m">
          <SelectTrigger className="!h-6 w-fit px-2 py-1.5 text-xs border border-[#272727]/10 rounded-lg">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last 30 days</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3">
        <div className="w-full">
          <div className="grid grid-rows-7 w-fit grid-flow-col gap-0.5">
            {heatmap.map((v, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-[2px] ${intensityToColor(v)}`}
              />
            ))}
          </div>
          <div className="font-medium flex justify-end items-center gap-2 mt-3 text-sm text-[#272727]/50">
            <span>Less</span>
            <div className="w-10.5 h-2.5 rounded-[2px] bg-[#e8ebe9]" />
            <div className="w-10.5 h-2.5 rounded-[2px] bg-[#e4f8e7]" />
            <div className="w-10.5 h-2.5 rounded-[2px] bg-[#25a47f]" />
            <div className="w-10.5 h-2.5 rounded-[2px] bg-[#0f7053]" />
            <span>More</span>
          </div>
        </div>
      </div>
    </section>
  );
}
