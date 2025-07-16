'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select';
import { Apple, Banana, Bot, Circle, Grape } from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, React.ReactNode> = {
  apple: <Apple className="h-4 w-4 mr-2" />,
  banana: <Banana className="h-4 w-4 mr-2" />,
  blueberry: <Circle className="h-4 w-4 mr-2" />, // Lucide doesn't have Blueberry
  grapes: <Grape className="h-4 w-4 mr-2" />,
  pineapple: <Grape className="h-4 w-4 mr-2" />,
};

const displayLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default function SelectAssistant() {
  const [selected, setSelected] = useState<string>('');

  return (
    <Select value={selected} onValueChange={setSelected}>
      <SelectTrigger className="border border-border rounded-lg w-full">
        <div className="flex items-center justify-between space-x-2">
          <Bot className="h-4 w-4 text-foreground" />
          <span>{selected ? displayLabel(selected) : 'Select a fruit'}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
