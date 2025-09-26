'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMemo } from 'react';

export default function ProfilePage() {
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
    <div className="flex flex-col py-10 pr-3 items-center">
      <div className="flex items-start justify-between gap-13 px-25 py-10 max-w-7xl">
        {/* Sidebar */}
        <aside className="bg-white ">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500" />
            <div>
              <div className="text-[#272727] text-sm font-medium">
                myarmygmae-9005
              </div>
              <div className="text-[10px] text-[#272727]/50">
                @myarmygmae-9005
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="my-4 flex justify-between text-[16px] text-[#272727]/50 leading-4 font-medium">
            Total prompts
            <span className="text-[#272727] font-medium">10</span>
          </div>
          <div className="space-y-1">
            <Button className="w-full">Edit profile</Button>
            <Button variant={'secondary'} className="w-full">
              Set profile to private
            </Button>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 w-fit">
          <section className="bg-white rounded-xl border border-[#272727]/10 p-4">
            <div className="flex items-center justify-between">
              <div className="text-[#272727] text-sm">
                Activity{' '}
                <span className="text-[#20a357]">(129 messages in total)</span>
              </div>
              <select className="h-7 px-2 rounded-md border border-[#272727]/10 text-xs text-[#272727]">
                <option>Last 12 months</option>
              </select>
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
                <div className="flex justify-end items-center gap-2 mt-2 text-[10px] text-[#272727]/60">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-[2px] bg-[#e6f6ef]" />
                  <div className="w-3 h-3 rounded-[2px] bg-[#c8eedf]" />
                  <div className="w-3 h-3 rounded-[2px] bg-[#9de1c7]" />
                  <div className="w-3 h-3 rounded-[2px] bg-[#6ccfa9]" />
                  <div className="w-3 h-3 rounded-[2px] bg-[#20a357]" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#272727]/10 p-8 h-72 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 rounded-lg bg-[#f3f4f6] mx-auto mb-2" />
              <div className="text-sm text-[#272727]/60">
                No community submissions to display.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
