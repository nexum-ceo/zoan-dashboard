import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Textarea,
} from '@/components/ui';
import { useCreateAgentMutation } from '@/queries/useAgent';
import { useGetModelByName } from '@/queries/useModel';
import { useProviderOfUserList } from '@/queries/useProvider';
import { CreateAgentBodySchema, CreateAgentBodyType } from '@/types/agent';

import { zodResolver } from '@hookform/resolvers/zod';
import MonacoEditor from '@monaco-editor/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function AddAgentForm() {
  const [jsonSchemaDialogOpen, setJsonSchemaDialogOpen] =
    useState<boolean>(false);
  const [jsonSchemaInput, setJsonSchemaInput] = useState<string>('');
  const [jsonSchemaError, setJsonSchemaError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const {
    data: providerData,
    isLoading: providerLoading,
    error: providerError,
  } = useProviderOfUserList();
  const providers = providerData?.data.data || [];

  // Model mutation hook
  const {
    mutate: getModelByName,
    isPending: modelLoading,
    error: modelError,
  } = useGetModelByName();

  // Create agent mutation hook
  const {
    mutate: createAgent,
    isPending: createLoading,
    error: createError,
  } = useCreateAgentMutation();

  const handleProviderChange = (providerId: string) => {
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

  const form = useForm<CreateAgentBodyType>({
    resolver: zodResolver(CreateAgentBodySchema),
    defaultValues: {
      name: '',
      description: '',
      max_tokens: 5,
      prompt: '',
      provider_id: '',
      model: 'deepseek',
      response_format: {
        type: 'text',
      },
      temperature: 1.0,
      top_p: 1.0,
    },
  });

  const onSubmit = (data: CreateAgentBodyType) => {
    setError(null);
    setSuccess(null);
    // Validate data before sending
    const validatedData = CreateAgentBodySchema.parse(data);

    // Use mutation hook to create agent
    createAgent(validatedData, {
      onSuccess: (responseData) => {
        if (responseData?.data.status === 'success') {
          setSuccess('Agent created successfully!');
          form.reset();
        } else {
          setError(responseData?.data.message || 'Create failed');
        }
      },
      onError: (err) => {
        console.error('Create agent error:', err);
        setError(err instanceof Error ? err.message : 'Create failed');
      },
    });
  };

  const handleCancel = () => {
    form.reset({
      name: '',
      description: '',
      max_tokens: 5,
      prompt: '',
      provider_id: '',
      model: 'deepseek',
      response_format: {
        type: 'text',
      },
      temperature: 1.0,
      top_p: 1.0,
    });
    setError(null);
    setSuccess(null);
    setJsonSchemaInput('');
    setJsonSchemaError(null);
  };

  return (
    <div className="w-full p-4 bg-background text-foreground">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* General Section */}
          <div>
            <div className="text-base font-semibold mb-3 flex items-center gap-2">
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
                    <FormLabel className="text-xs font-medium text-muted-foreground">
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
                    <FormLabel className="text-xs font-medium text-muted-foreground">
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
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Provider
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          handleProviderChange(val);
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
                      <FormLabel className="text-xs font-medium text-muted-foreground w-[180px]">
                        Model
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                    <FormLabel className="text-xs font-medium text-muted-foreground">
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
          <div className="border-t border-border" />

          {/* Model Config Section */}
          <div>
            <div className="text-base font-semibold mb-3 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-primary rounded-full" />
              Model Configuration
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Response format */}
                <FormField
                  control={form.control}
                  name="response_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Response format
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          if (val === 'json_schema') {
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
                            } else {
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
                          <SelectTrigger className="rounded-md h-8">
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
                          <DialogTitle>Add response format</DialogTitle>
                          <DialogDescription className="mt-1">
                            Use a JSON schema to define the structure of the
                            model&apos;s response format.
                          </DialogDescription>
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 min-h-0 h-full w-full gap-1 px-2 pb-1 mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="mb-1 text-muted-foreground">
                            Definition
                          </Label>
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
                              className="rounded border border-border focus-within:border-ring bg-card text-card-foreground overflow-hidden shadow-sm"
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
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Max Tokens
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            className="w-15 h-6 text-xs rounded-md no-spinner"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormControl className="flex-1">
                          <Slider
                            max={8192}
                            min={5}
                            step={1}
                            value={[field.value ?? 5]}
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

              {/* Temperature and Top P in compact grid */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Temperature
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-13 h-6 text-xs rounded-md no-spinner"
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
                      <FormLabel className="text-xs font-medium text-muted-foreground">
                        Top P
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-13 h-6 text-xs rounded-md no-spinner"
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
          <div className="flex flex-row gap-2 items-center justify-end pt-2 border-t border-border">
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
              disabled={createLoading || providerLoading || modelLoading}
              className="rounded-md h-8 px-3 text-sm"
            >
              {createLoading
                ? 'Creating...'
                : providerLoading
                ? 'Loading providers...'
                : modelLoading
                ? 'Loading models...'
                : 'Create'}
            </Button>
          </div>

          {/* Error/Success messages */}
          {(error || providerError || modelError || createError) && (
            <div className="text-red-500 text-xs text-right">
              {error ||
                (createError instanceof Error
                  ? createError.message
                  : 'Failed to create agent') ||
                (providerError instanceof Error
                  ? providerError.message
                  : 'Failed to load providers') ||
                (modelError instanceof Error
                  ? modelError.message
                  : 'Failed to load models')}
            </div>
          )}
          {success && (
            <div className="text-green-500 text-xs text-right">{success}</div>
          )}
        </form>
      </Form>
    </div>
  );
}
