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
  AgentType,
  CreateAgentResType,
  UpdateAgentBodySchema,
  UpdateAgentBodyType,
} from '@/types/agent';
import {
  GetModelResType,
  GetProviderOfUserResType,
  ProviderOfUserType,
} from '@/types/provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useParams } from 'next/navigation';

export default function Configuration() {
  const params = useParams();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : '';
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderOfUserType[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [agent, setAgent] = useState<AgentType>();
  const form = useForm<UpdateAgentBodyType>({
    resolver: zodResolver(UpdateAgentBodySchema),
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
      provider_id: '',
      model: 'deepseek',
      response_format: {},
    },
  });
  // Fetch agent detail and fill form
  useEffect(() => {
    if (!id) return;
    const fetchAgent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/agent/${id}`);
        const data = await res.json();
        console.log('Fetched agent data:', data);
        if (data) {
          setAgent(data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Fetch agent failed');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [id, form]);

  // Reset form chỉ khi models đã fetch xong và chứa agent.model
  useEffect(() => {
    const fetchModels = async (providerId: string) => {
      if (!providerId) return;
      setLoading(true);
      try {
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
        }
      } catch (err) {
        console.log('Error fetching models:', err);
        setModels([]);
      } finally {
        setLoading(false);
      }
    };
    if (agent && providers.length > 0) {
      setSelectedProvider(agent.provider_id || '');
      fetchModels(agent.provider_id || '');
    }
  }, [agent, providers]);

  useEffect(() => {
    // Chỉ reset form khi models đã fetch xong và chứa agent.model
    if (
      agent &&
      models.length > 0 &&
      (models.includes(agent.model) ||
        agent.model === '' ||
        agent.model === undefined)
    ) {
      form.reset({
        name: agent.name || '',
        description: agent.description || '',
        prompt: agent.prompt || '',
        provider_id: agent.provider_id || '',
        model: agent.model || '',
        response_format: {
          type: agent.response_format?.type || 'text',
        },
        model_kwargs: {
          max_tokens: agent.model_kwargs?.max_tokens || 1000,
          temperature: agent.model_kwargs?.temperature || 0.7,
          top_p: agent.model_kwargs?.top_p || 1.0,
        },
      });
    }
  }, [models, agent, form]);

  useEffect(() => {
    fetchProvider();
  }, []);

  console.log('Agent data:', agent);
  console.log('form data', form.getValues());
  const handleProviderChange = async (providerId: string) => {
    setSelectedProvider(providerId);
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
        // setError('No models found.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Fetch failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateAgentBodyType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData: CreateAgentResType = await res.json();
      if (responseData.status === 'success') {
        setSuccess('Agent updated successfully!');
        form.reset();
      } else {
        setError(responseData.message || 'Update failed');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Updated failed');
      }
    } finally {
      setLoading(false);
    }
  };
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
        setError(err.message);
      } else {
        setError('Fetch failed');
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
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-2">
      <div className="w-full h-full rounded-2xl shadow-xl bg-white/90 border border-gray-200 p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            {/* General Section */}
            <div>
              <div className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <span className="inline-block w-1.5 h-6 bg-primary rounded-full mr-2" />
                General Configuration
              </div>
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Agent name"
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description field on its own row */}
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Short description"
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FormField
                  control={form.control}
                  name="provider_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Provider
                      </FormLabel>
                      <Select
                        onValueChange={async (val) => {
                          field.onChange(val);
                          await handleProviderChange(val);
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select a provider" />
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
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Model
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={!selectedProvider}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="rounded-lg min-w-[180px]"
                            disabled={!selectedProvider}
                          >
                            <SelectValue placeholder="Select a model" />
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

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        System Instruction
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="System prompt (optional)"
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2" />

            {/* Model Config Section */}
            <div>
              <div className="text-xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <span className="inline-block w-1.5 h-6 bg-primary rounded-full mr-2" />
                Model Configuration
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="response_format.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Response format
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
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

                <FormField
                  control={form.control}
                  name="model_kwargs.temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Temperature
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-20 rounded-lg no-spinner"
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
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model_kwargs.top_p"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Top P
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-20 rounded-lg no-spinner"
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
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions & Status */}
            <div className="flex flex-row gap-3 items-center w-full justify-end mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="rounded-lg bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="rounded-lg">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
            {error && (
              <div className="text-red-500 text-sm mt-2 text-right">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-500 text-sm mt-2 text-right">
                {success}
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
