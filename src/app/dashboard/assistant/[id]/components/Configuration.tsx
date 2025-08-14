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
  useGetSpecificAgent,
  useUpdateAgentMutation,
} from '@/queries/useAgent';
import { useGetModelByName } from '@/queries/useModel';
import { useProviderOfUserList } from '@/queries/useProvider';
import {
  CreateAgentBodySchema,
  CreateAgentBodyType,
  UpdateAgentBodyType,
} from '@/types/agent';

import { zodResolver } from '@hookform/resolvers/zod';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Configuration() {
  const params = useParams();
  const { theme } = useTheme();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : '';
  const [jsonSchemaDialogOpen, setJsonSchemaDialogOpen] = useState(false);
  const [jsonSchemaInput, setJsonSchemaInput] = useState('');
  const [jsonSchemaError, setJsonSchemaError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);

  // Fetch hooks
  const {
    data: providerData,
    isLoading: providerLoading,
    error: providerError,
  } = useProviderOfUserList();

  const {
    data: agentData,
    isLoading: agentLoading,
    error: agentError,
  } = useGetSpecificAgent(id);

  const {
    mutate: getModelByName,
    isPending: modelLoading,
    error: modelError,
  } = useGetModelByName();

  const {
    mutate: updateAgent,
    isPending: updateLoading,
    error: updateError,
  } = useUpdateAgentMutation(id);

  // Process data
  const providers = useMemo(
    () => providerData?.data.data || [],
    [providerData],
  );
  const agent = agentData?.data;
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

  // Fetch models when agent and providers are loaded
  useEffect(() => {
    if (agent && providers.length > 0 && agent.provider_id) {
      setSelectedProvider(agent.provider_id);
      const providerObj = providers.find((p) => p.id === agent.provider_id);
      const providerName = providerObj
        ? providerObj.provider
        : agent.provider_id;

      getModelByName(providerName, {
        onSuccess: (data) => {
          if (
            data &&
            data.data.status === 'success' &&
            Array.isArray(data.data.data)
          ) {
            setModels(data.data.data);
          } else {
            setModels([]);
          }
        },
        onError: () => {
          setModels([]);
          setError('Failed to fetch models');
        },
      });
    }
  }, [agent, providers, getModelByName]);

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

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);

    // Find the provider object by id
    const providerObj = providers.find((p) => p.id === providerId);
    const providerName = providerObj ? providerObj.provider : providerId;

    // Use mutation hook to get models
    getModelByName(providerName, {
      onSuccess: (data) => {
        if (
          data &&
          data.data.status === 'success' &&
          Array.isArray(data.data.data)
        ) {
          setModels(data.data.data);
          setError(null);
        } else {
          setModels([]);
          setError('No models found.');
        }
      },
      onError: (err) => {
        setModels([]);
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
      },
    });
  };

  const onSubmit = (data: CreateAgentBodyType) => {
    setError(null);
    setSuccess(null);

    // Validate data before sending
    const validatedData = CreateAgentBodySchema.parse(data);

    // Transform form data to update format
    if (!agent) {
      setError('Agent data not loaded');
      return;
    }

    const updateData: UpdateAgentBodyType = {
      ...agent,
      name: validatedData.name,
      description: validatedData.description,
      prompt: validatedData.prompt,
      provider_id: validatedData.provider_id,
      model: validatedData.model,
      response_format: validatedData.response_format,
      model_kwargs: {
        max_tokens: validatedData.max_tokens || 1000,
        temperature: validatedData.temperature,
        top_p: validatedData.top_p,
      },
    };

    // Use mutation hook to update agent
    updateAgent(updateData, {
      onSuccess: (responseData) => {
        if (responseData?.data?.status === 'success') {
          setSuccess('Agent updated successfully!');
        } else {
          setError(responseData?.data?.message || 'Update failed');
        }
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'Update failed');
      },
    });
  };

  const handleCancel = () => {
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
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 rounded-lg">
      <div className="w-full h-full shadow-xl bg-card/90 border border-border p-4 rounded-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-8"
          >
            {/* General Section */}
            <div>
              <div className="text-xl font-semibold mb-2 text-foreground flex items-center gap-2">
                <span className="inline-block w-1.5 h-6 bg-primary rounded-full mr-2" />
                General Configuration
              </div>
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-foreground">
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
                      <FormLabel className="text-[13px] font-medium text-foreground">
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
                      <FormLabel className="text-[13px] font-medium text-foreground">
                        Provider
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleProviderChange(val);
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
                      <FormLabel className="text-[13px] font-medium text-foreground">
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
                      <FormLabel className="text-[13px] font-medium text-foreground">
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
            <div className="border-t border-border my-2" />

            {/* Model Config Section */}
            <div>
              <div className="text-xl font-semibold mb-2 text-foreground flex items-center gap-2">
                <span className="inline-block w-1.5 h-6 bg-primary rounded-full mr-2" />
                Model Configuration
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="response_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-medium text-foreground">
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
                              className="rounded border border-border focus-within:border-primary bg-background overflow-hidden shadow-sm"
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
                                theme={theme === 'dark' ? 'vs-dark' : 'light'}
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
                            <div className="text-xs text-destructive mt-1">
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
                      <FormLabel className="text-[13px] font-medium text-foreground">
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
                      <FormLabel className="text-[13px] font-medium text-foreground">
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
                      <FormLabel className="text-[13px] font-medium text-foreground">
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
              <Button
                type="submit"
                disabled={
                  updateLoading ||
                  agentLoading ||
                  providerLoading ||
                  modelLoading
                }
                className="rounded-lg"
              >
                {updateLoading
                  ? 'Saving...'
                  : agentLoading
                  ? 'Loading agent...'
                  : providerLoading
                  ? 'Loading providers...'
                  : modelLoading
                  ? 'Loading models...'
                  : 'Save Changes'}
              </Button>
            </div>
            {(error ||
              agentError ||
              providerError ||
              modelError ||
              updateError) && (
              <div className="text-destructive text-sm mt-2 text-right">
                {error ||
                  (agentError instanceof Error
                    ? agentError.message
                    : 'Failed to load agent') ||
                  (providerError instanceof Error
                    ? providerError.message
                    : 'Failed to load providers') ||
                  (modelError instanceof Error
                    ? modelError.message
                    : 'Failed to load models') ||
                  (updateError instanceof Error
                    ? updateError.message
                    : 'Failed to update agent')}
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
