'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

export default function Configuration() {
  const [temperature, setTemperature] = useState<number>(1.0);
  const [topP, setTopP] = useState<number>(1.0);

  return (
    <div className="flex flex-col gap-4 w-full h-full p-4 justify-between">
      <div className="flex flex-col gap-4">
        <div className="text-lg font-medium">General Configuration</div>
        <div className="flex flex-col gap-1">
          <div className="text-[12px] font-medium">Name</div>
          <Input />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[12px] font-medium">System Instruction</div>
          <Input />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[12px] font-medium">Model</div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-lg font-medium mt-2">Model Configuration</div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-1 justify-between items-center">
              <div className="text-[12px] font-medium">Response format</div>
              <div className="text-[12px] text-muted-foreground">
                (Optional)
              </div>
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-1 justify-between items-center">
              <div className="text-[12px] font-medium">Temperature</div>
              <Input
                type="number"
                step="0.01"
                className="w-13 no-spinner"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
              />
            </div>
            <Slider
              max={2}
              min={0}
              step={0.01}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-row gap-1 justify-between items-center">
              <div className="text-[12px] font-medium">Top P</div>
              <Input
                type="number"
                step="0.01"
                className="w-13 no-spinner"
                value={topP}
                onChange={(e) => setTopP(Number(e.target.value))}
              />
            </div>
            <Slider
              max={1}
              min={0}
              step={0.01}
              value={[topP]}
              onValueChange={(value) => setTopP(value[0])}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center w-full justify-end">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
