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
import { CreateAgentBodyType, CreateAgentResType } from '@/types/agent';
import { useState } from 'react';

export default function Configuration() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [responseFormat, setResponseFormat] = useState('text');
  const [temperature, setTemperature] = useState<number>(1.0);
  const [topP, setTopP] = useState<number>(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const body: CreateAgentBodyType = {
      name,
      description,
      prompt,
      model: 'deepseek-chat',
      response_format: responseFormat,
      temperature,
      top_p: topP,
    };
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data: CreateAgentResType = await res.json();
      if (data.status === 'success') {
        setSuccess('Agent created successfully!');
      } else {
        setError(data.message || 'Create failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full p-4 justify-between">
      <div className="flex flex-col gap-4">
        <div className="text-lg font-medium">General Configuration</div>
        <div className="flex flex-col gap-1">
          <div className="text-[12px] font-medium">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[12px] font-medium">Description</div>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[12px] font-medium">System Instruction</div>
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[12px] font-medium">Model</div>
          <Select value={model} onValueChange={setModel}>
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
            <Select value={responseFormat} onValueChange={setResponseFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select response format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
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
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {success && <div className="text-green-500 text-sm mt-2">{success}</div>}
    </div>
  );
}
