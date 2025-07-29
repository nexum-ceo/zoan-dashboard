'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  CreateAgentBodySchema,
  CreateAgentBodyType,
  CreateAgentResType,
} from '@/types/agent';
import {
  GetModelResType,
  GetProviderOfUserResType,
  ProviderOfUserType,
} from '@/types/provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function AddAgentForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderOfUserType[]>([]);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await fetch('/api/provider-user');
        const data: GetProviderOfUserResType = await res.json();
        if (data.status === 'success') {
          setProviders(data.data);
        } else {
          setProviders([]);
          setError('No providers found.');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Fetch failed');
        } else {
          setError('Fetch failed');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, []);

  // Chỉ fetch model khi user chọn provider
  const handleProviderChange = async (providerId: string) => {
    setLoading(true);
    try {
      // Find the provider object by id
      const providerObj = providers.find((p) => p.id === providerId);
      const providerName = providerObj ? providerObj.provider : providerId;
      const res = await fetch('/api/model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: providerName }),
      });
      const data: GetModelResType = await res.json();
      if (data.status === 'success') {
        setModels(data.data);
      } else {
        setModels([]);
        setError('No models found.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Fetch failed');
      } else {
        setError('Fetch failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<CreateAgentBodyType>({
    resolver: zodResolver(CreateAgentBodySchema),
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
      provider_id: '',
      model: 'deepseek',
      response_format: 'text',
      temperature: 1.0,
      top_p: 1.0,
    },
  });

  const onSubmit = async (data: CreateAgentBodyType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData: CreateAgentResType = await res.json();
      if (responseData.status === 'success') {
        setSuccess('Agent created successfully!');
        form.reset();
      } else {
        setError(responseData.message || 'Create failed');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Create failed');
      } else {
        setError('Create failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="w-full p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* General Section */}
          <div>
            <div className="text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-primary rounded-full" />
              General Configuration
            </div>

            {/* Name and Description in single column */}
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Agent name"
                        className="rounded-md h-8"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Short description"
                        className="rounded-md resize-none h-16"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Provider and Model in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-700">
                        Provider
                      </FormLabel>
                      <Select
                        onValueChange={async (val) => {
                          field.onChange(val);
                          await handleProviderChange(val);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-md h-8">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-700 w-[180px]">
                        Model
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={'deepseek'}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-md h-8">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">
                      System Instruction
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="System prompt (optional)"
                        className="rounded-md h-8"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Model Config Section */}
          <div>
            <div className="text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-primary rounded-full" />
              Model Configuration
            </div>

            <div className="space-y-3">
              {/* Response format */}
              <FormField
                control={form.control}
                name="response_format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-gray-700">
                      Response format
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-md h-8">
                          <SelectValue placeholder="Select response format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Temperature and Top P in compact grid */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-700">
                        Temperature
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-12 h-6 text-xs rounded-md no-spinner"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormControl className="flex-1">
                          <Slider
                            max={2}
                            min={0}
                            step={0.01}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="h-4"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="top_p"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-700">
                        Top P
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-12 h-6 text-xs rounded-md no-spinner"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormControl className="flex-1">
                          <Slider
                            max={1}
                            min={0}
                            step={0.01}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="h-4"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex flex-row gap-2 items-center justify-end pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-md h-8 px-3 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-md h-8 px-3 text-sm"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Error/Success messages */}
          {error && (
            <div className="text-red-500 text-xs text-right">{error}</div>
          )}
          {success && (
            <div className="text-green-500 text-xs text-right">{success}</div>
          )}
        </form>
      </Form>
    </div>
  );
}
