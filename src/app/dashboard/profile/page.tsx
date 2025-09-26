'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Github from '../../../../public/icon/github';
import Globe from '../../../../public/icon/globe';
import MapPin from '../../../../public/icon/map-pin';
import X from '../../../../public/icon/x';

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

  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-col py-10 pr-3 items-center">
      <div className="flex items-start justify-between gap-13 px-25 py-10 max-w-7xl">
        {/* Sidebar */}
        <aside className="bg-white w-full">
          <AnimatePresence initial={false} mode="wait">
            {!editing ? (
              <motion.div
                key="summary"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden p-1"
              >
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
                  <Button className="w-full" onClick={() => setEditing(true)}>
                    Edit profile
                  </Button>
                  <Button variant={'secondary'} className="w-full">
                    Set profile to private
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-1 space-y-4 p-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500" />
                  <div className="space-y-1">
                    <Label className="text-sm text-[#272727]">
                      Display name
                    </Label>
                    <Input
                      placeholder="SCao"
                      className="w-full h-6.5 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-[#272727]">UserName</Label>
                    <Input
                      placeholder="myarmygmae-9005"
                      className="w-full h-6.5 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-[#272727]">Bio</Label>
                    <Textarea
                      placeholder="Bio"
                      className="w-full min-h-30 bg-[#272727]/5 border-0 text-sm font-medium placeholder:text-[#272727]/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-[#272727]">Socials</Label>
                    <div className="space-y-2">
                      <div className="relative w-full">
                        <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                        <Input
                          placeholder="Location"
                          className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                        />
                      </div>

                      <div className="relative w-full">
                        <X className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                        <Input
                          placeholder="X"
                          className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                        />
                      </div>

                      <div className="relative w-full">
                        <Github className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                        <Input
                          placeholder="Github"
                          className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                        />
                      </div>

                      <div className="relative w-full">
                        <Globe className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#272727]" />
                        <Input
                          placeholder="Website"
                          className="w-full h-6.5 pl-7 bg-gray-100 border-0 rounded-lg text-sm placeholder:text-[#272727]/50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-1">
                    <Button className="w-full ">Save changes</Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <Separator className="my-5" />

                  <div className="my-4 flex justify-between text-[16px] text-[#272727]/50 leading-4 font-medium">
                    Total prompts
                    <span className="text-[#272727] font-medium">10</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Main */}
        <main className="space-y-4 w-fit">
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

          <section className="bg-white p-2 border border-dashed border-[#272727]/10 rounded-lg space-y-3">
            <div className="font-medium text-sm leading-4.5 text-[#272727]">
              Show case
            </div>
            <div className="text-center pt-[177px] pb-[148px] flex flex-col items-center justify-center">
              <div className="p-1 border border-[#272727]/10 rounded-md">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-sm text-[#272727]/20 font-medium">
                No community submissions to display.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
