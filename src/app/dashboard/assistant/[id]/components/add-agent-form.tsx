// // Example schemas for dropdown
// const exampleSchemas: Record<string, string> = {
//   math_response: `{
//   "name": "math_response",
//   "strict": true,
//   "schema": {
//     "type": "object",
//     "properties": {
//       "steps": {
//         "type": "array",
//         "items": {
//           "type": "object",
//           "properties": {
//             "explanation": { "type": "string" },
//             "output": { "type": "string" }
//           },
//           "required": ["explanation", "output"],
//           "additionalProperties": false
//         }
//       },
//       "final_answer": { "type": "string" }
//     },
//     "required": ["steps", "final_answer"],
//     "additionalProperties": false
//   }
// }`,
//   paper_metadata: `{
//   "name": "paper_metadata",
//   "strict": true,
//   "schema": {
//     "type": "object",
//     "properties": {
//       "title": { "type": "string" },
//       "authors": {
//         "type": "array",
//         "items": { "type": "string" }
//       },
//       "abstract": { "type": "string" }
//     },
//     "required": ["title", "authors", "abstract"],
//     "additionalProperties": false
//   }
// }`,
//   moderation: `{
//   "name": "moderation",
//   "strict": true,
//   "schema": {
//     "type": "object",
//     "properties": {
//       "flagged": { "type": "boolean" },
//       "categories": {
//         "type": "array",
//         "items": { "type": "string" }
//       }
//     },
//     "required": ["flagged", "categories"],
//     "additionalProperties": false
//   }
// }`,
// };
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
// import { mongoTheme } from '@/lib/monacoTheme';
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
import MonacoEditor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function AddAgentForm() {
  const [jsonSchemaDialogOpen, setJsonSchemaDialogOpen] = useState(false);
  const [jsonSchemaInput, setJsonSchemaInput] = useState('');
  const [jsonSchemaError, setJsonSchemaError] = useState<string | null>(null);
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
              <div className="grid grid-cols-2 gap-3">
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
                        onValueChange={(val) => {
                          if (val === 'json_schema') {
                            const current = form.getValues('response_format');
                            if (
                              typeof current === 'object' &&
                              current !== null &&
                              !('type' in current)
                            ) {
                              setJsonSchemaInput(
                                JSON.stringify(current, null, 2),
                              );
                            } else {
                              setJsonSchemaInput('');
                            }
                            setJsonSchemaDialogOpen(true);
                          } else {
                            field.onChange({ type: val });
                          }
                        }}
                        value={
                          typeof field.value === 'object' &&
                          !('type' in field.value)
                            ? 'json_schema'
                            : typeof field.value === 'object' &&
                              'type' in field.value
                            ? field.value.type
                            : field.value
                        }
                        defaultValue={
                          typeof field.value === 'object' &&
                          !('type' in field.value)
                            ? 'json_schema'
                            : typeof field.value === 'object' &&
                              'type' in field.value
                            ? field.value.type
                            : field.value
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-md h-8">
                            <SelectValue placeholder="Select response format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
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
                          <Label className="mb-1">Definition</Label>
                          <Select>
                            <SelectTrigger className="rounded-md h-8">
                              <SelectValue placeholder="Select JSON schema" />
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
                              setJsonSchemaDialogOpen(false);
                              setJsonSchemaError(null);
                              form.setValue('response_format', parsed);
                            } catch {
                              setJsonSchemaError('Invalid JSON');
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
                      <FormLabel className="text-xs font-medium text-gray-700">
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
                      <FormLabel className="text-xs font-medium text-gray-700">
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
                      <FormLabel className="text-xs font-medium text-gray-700">
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
              {loading ? 'Saving...' : 'Create'}
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
