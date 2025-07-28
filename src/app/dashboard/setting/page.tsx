'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GetProviderResType } from '@/types/provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/provider');
        const data: GetProviderResType = await res.json();
        if (data.status === 'success') {
          setProviders(data.data);
        } else {
          setProviders([]);
          setError('No providers found.');
        }
      } catch (err: any) {
        setError(err?.message || 'Fetch failed');
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  return (
    <div className="w-full h-full bg-sidebar rounded-lg border border-border flex flex-col p-2">
      <div className="p-4 flex items-center justify-between text-2xl font-semibold border-b border-border bg-white rounded-t-lg w-full">
        <span>Your list providers</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Add Provider</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add New Provider</DialogTitle>
              <DialogDescription>
                Enter the provider name and API token you want to add.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
                disabled={createLoading}
              >
                <SelectTrigger className="w-full" autoFocus>
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="API Token..."
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                disabled={createLoading}
                name="api_token"
              />
            </div>
            {createError && (
              <div className="text-red-500 text-sm mt-2">{createError}</div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedProvider('');
                    setApiToken('');
                    setCreateError(null);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={async () => {
                  setCreateLoading(true);
                  setCreateError(null);
                  if (!selectedProvider) {
                    setCreateError('Provider name is required');
                    setCreateLoading(false);
                    return;
                  }
                  if (!apiToken.trim()) {
                    setCreateError('API Token is required');
                    setCreateLoading(false);
                    return;
                  }
                  // TODO: Replace with real API call
                  setTimeout(() => {
                    setSelectedProvider('');
                    setApiToken('');
                    setCreateLoading(false);
                    setOpen(false);
                  }, 700);
                }}
                disabled={createLoading}
              >
                {createLoading ? 'Adding...' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="m-2 flex-1 flex flex-row gap-3 p-2">
        <Table className="w-full h-fit bg-white border border-border rounded-lg">
          <TableCaption>A list of acceptable providers.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead className="w-[100px]">Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No providers found.
                </TableCell>
              </TableRow>
            ) : (
              providers.map((provider, index) => (
                <TableRow
                  key={provider}
                  className="cursor-pointer hover:bg-muted transition-colors"
                >
                  <TableCell className="font-medium">{index}</TableCell>
                  <TableCell className="font-medium">{provider}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
