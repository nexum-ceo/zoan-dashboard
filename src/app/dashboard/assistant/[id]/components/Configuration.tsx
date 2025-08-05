'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import MonacoEditor from '@monaco-editor/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Configuration() {
  const params = useParams();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : '';
  const [jsonSchemaDialogOpen, setJsonSchemaDialogOpen] = useState(false);
  const [jsonSchemaInput, setJsonSchemaInput] = useState('');
  const [jsonSchemaError, setJsonSchemaError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderOfUserType[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [agent, setAgent] = useState<AgentType>();
  const form = useForm<CreateAgentBodyType>({
    resolver: zodResolver(CreateAgentBodySchema),
    defaultValues: {
      name: '',
      description: '',
      prompt: '',
      provider_id: '',
      model: 'deepseek',
      response_format: {
        type: 'text',
      },
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 1.0,
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

  // Reset form only when models have fetched and contains agent.model
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
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Fetch model failed');
        }
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
    // Reset form only when models have fetched and contains agent.model
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
        response_format: agent.response_format || { type: 'text' },
        max_tokens: agent.model_kwargs?.max_tokens || 1000,
        temperature: agent.model_kwargs?.temperature || 0.7,
        top_p: agent.model_kwargs?.top_p || 1.0,
      });

      // Pre-populate JSON schema input if agent has json_schema response format
      if (
        agent.response_format &&
        typeof agent.response_format === 'object' &&
        'type' in agent.response_format &&
        agent.response_format.type === 'json_schema' &&
        'json_schema' in agent.response_format
      ) {
        setJsonSchemaInput(
          JSON.stringify(agent.response_format.json_schema, null, 2),
        );
      }
    }
  }, [models, agent, form]);

  useEffect(() => {
    fetchProvider();
  }, []);

  // Watch for response_format changes to update JSON schema input
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'response_format') {
        const responseFormat = value.response_format;
        if (
          responseFormat &&
          typeof responseFormat === 'object' &&
          'type' in responseFormat &&
          responseFormat.type === 'json_schema' &&
          'json_schema' in responseFormat
        ) {
          setJsonSchemaInput(
            JSON.stringify(responseFormat.json_schema, null, 2),
          );
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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

  const onSubmit = async (data: CreateAgentBodyType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate data before sending
      const validatedData = CreateAgentBodySchema.parse(data);

      console.log('Updating agent data:', validatedData);

      const res = await fetch(`/api/agent/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseData: CreateAgentResType = await res.json();

      if (responseData.status === 'success') {
        setSuccess('Agent updated successfully!');
        // Don't reset form in edit mode - keep current values
      } else {
        setError(responseData.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update agent error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Update failed');
      } else {
        setError('Update failed');
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
    // Reset form to original agent values in edit mode
    if (agent) {
      form.reset({
        name: agent.name || '',
        description: agent.description || '',
        prompt: agent.prompt || '',
        provider_id: agent.provider_id || '',
        model: agent.model || '',
        response_format: agent.response_format || { type: 'text' },
        max_tokens: agent.model_kwargs?.max_tokens || 1000,
        temperature: agent.model_kwargs?.temperature || 0.7,
        top_p: agent.model_kwargs?.top_p || 1.0,
      });
    }
    setError(null);
    setSuccess(null);
    setJsonSchemaInput('');
    setJsonSchemaError(null);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
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
                  name="response_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Response format
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          if (val === 'json_schema') {
                            // Always get current form value first
                            const current = form.getValues('response_format');
                            console.log(
                              'Current response_format value:',
                              current,
                            );

                            if (
                              typeof current === 'object' &&
                              current !== null &&
                              'type' in current &&
                              current.type === 'json_schema' &&
                              'json_schema' in current
                            ) {
                              // Load existing JSON schema
                              setJsonSchemaInput(
                                JSON.stringify(current.json_schema, null, 2),
                              );
                            } else {
                              // Default template for new JSON schema
                              setJsonSchemaInput(
                                '{\n  "type": "object",\n  "properties": {\n    "result": {\n      "type": "string"\n    }\n  },\n  "required": ["result"]\n}',
                              );
                            }
                            setJsonSchemaDialogOpen(true);
                          } else {
                            field.onChange({ type: val });
                          }
                        }}
                        value={
                          typeof field.value === 'object' &&
                          field.value !== null &&
                          'type' in field.value
                            ? field.value.type
                            : 'text'
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select response format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="json_object">JSON</SelectItem>
                          <SelectItem value="json_schema">
                            JSON Schema
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {/* Edit JSON Schema Button */}
                      {form.watch('response_format') &&
                        typeof form.watch('response_format') === 'object' &&
                        form.watch('response_format') !== null &&
                        'type' in form.watch('response_format') &&
                        form.watch('response_format').type ===
                          'json_schema' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-1 h-6 px-2 text-xs w-fit"
                            onClick={() => {
                              const current = form.getValues('response_format');
                              if (
                                typeof current === 'object' &&
                                current !== null &&
                                'type' in current &&
                                current.type === 'json_schema' &&
                                'json_schema' in current
                              ) {
                                setJsonSchemaInput(
                                  JSON.stringify(current.json_schema, null, 2),
                                );
                              }
                              setJsonSchemaDialogOpen(true);
                            }}
                          >
                            Edit Schema
                          </Button>
                        )}
                    </FormItem>
                  )}
                />
                {/* Dialog fill JSON schema */}
                <Dialog
                  open={jsonSchemaDialogOpen}
                  onOpenChange={setJsonSchemaDialogOpen}
                >
                  <DialogContent
                    style={{
                      maxWidth: '60vw',
                      width: '100%',
                      maxHeight: '75vh',
                      height: '100%',
                    }}
                  >
                    <div className="flex flex-col flex-1 min-h-0 h-full w-full">
                      <div className="px-2 py-2 pb-1 flex items-center justify-between">
                        <div>
                          <DialogTitle>Edit response format</DialogTitle>
                          <DialogDescription className="mt-1">
                            Use a JSON schema to define the structure of the
                            model&apos;s response format.
                          </DialogDescription>
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 min-h-0 h-full w-full gap-1 px-2 pb-1 mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="mb-1">Definition</Label>
                          <Select
                            onValueChange={(value) => {
                              const templates = {
                                math_response: {
                                  type: 'object',
                                  properties: {
                                    steps: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          explanation: { type: 'string' },
                                          output: { type: 'string' },
                                        },
                                        required: ['explanation', 'output'],
                                      },
                                    },
                                    final_answer: { type: 'string' },
                                  },
                                  required: ['steps', 'final_answer'],
                                },
                                paper_metadata: {
                                  type: 'object',
                                  properties: {
                                    title: { type: 'string' },
                                    authors: {
                                      type: 'array',
                                      items: { type: 'string' },
                                    },
                                    abstract: { type: 'string' },
                                    keywords: {
                                      type: 'array',
                                      items: { type: 'string' },
                                    },
                                  },
                                  required: ['title', 'authors', 'abstract'],
                                },
                                moderation: {
                                  type: 'object',
                                  properties: {
                                    flagged: { type: 'boolean' },
                                    categories: {
                                      type: 'object',
                                      properties: {
                                        harassment: { type: 'boolean' },
                                        hate: { type: 'boolean' },
                                        violence: { type: 'boolean' },
                                      },
                                    },
                                    confidence_scores: {
                                      type: 'object',
                                      properties: {
                                        harassment: { type: 'number' },
                                        hate: { type: 'number' },
                                        violence: { type: 'number' },
                                      },
                                    },
                                  },
                                  required: ['flagged', 'categories'],
                                },
                              };
                              const template =
                                templates[value as keyof typeof templates];
                              if (template) {
                                setJsonSchemaInput(
                                  JSON.stringify(template, null, 2),
                                );
                              }
                            }}
                          >
                            <SelectTrigger className="rounded-md h-8">
                              <SelectValue placeholder="Select JSON schema template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="math_response">
                                Math Response
                              </SelectItem>
                              <SelectItem value="paper_metadata">
                                Paper Metadata
                              </SelectItem>
                              <SelectItem value="moderation">
                                Moderation
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div className="flex-1 min-h-0">
                            <div
                              className="rounded border border-gray-300 focus-within:border-primary bg-white overflow-hidden shadow-sm"
                              style={{ height: '100%' }}
                            >
                              <MonacoEditor
                                height="100%"
                                defaultLanguage="json"
                                language="json"
                                value={jsonSchemaInput}
                                onChange={(val) =>
                                  setJsonSchemaInput(val ?? '')
                                }
                                options={{
                                  minimap: { enabled: false },
                                  fontSize: 13,
                                  wordWrap: 'on',
                                  scrollBeyondLastLine: false,
                                  automaticLayout: true,
                                  formatOnPaste: true,
                                  formatOnType: true,
                                  lineNumbers: 'off',
                                  scrollbar: {
                                    vertical: 'auto',
                                    horizontal: 'auto',
                                  },
                                  padding: { top: 10, bottom: 10 },
                                }}
                              />
                            </div>
                          </div>
                          {jsonSchemaError && (
                            <div className="text-xs text-red-500 mt-1">
                              {jsonSchemaError}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end items-end gap-2 px-2 pb-2 mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setJsonSchemaDialogOpen(false);
                            setJsonSchemaError(null);
                          }}
                          className="h-8 px-3 text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="h-8 px-3 text-sm"
                          onClick={() => {
                            try {
                              const parsed = JSON.parse(jsonSchemaInput);

                              // Validate basic JSON Schema structure
                              if (!parsed || typeof parsed !== 'object') {
                                setJsonSchemaError(
                                  'JSON Schema must be an object',
                                );
                                return;
                              }

                              // Basic validation for JSON Schema format
                              if (!parsed.type || !parsed.properties) {
                                setJsonSchemaError(
                                  'JSON Schema must have "type" and "properties" fields',
                                );
                                return;
                              }

                              setJsonSchemaDialogOpen(false);
                              setJsonSchemaError(null);

                              // Set correct discriminated union format
                              form.setValue('response_format', {
                                type: 'json_schema' as const,
                                json_schema: parsed,
                              });
                            } catch {
                              setJsonSchemaError('Invalid JSON format');
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <FormField
                  control={form.control}
                  name="max_tokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-gray-700">
                        Max Tokens
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            className="w-15 rounded-lg no-spinner"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormControl className="flex-1">
                          <Slider
                            max={8912}
                            min={5}
                            step={1}
                            value={[field.value as number]}
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
                  name="temperature"
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
                  name="top_p"
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
