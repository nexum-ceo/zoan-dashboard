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
import { formatDate } from '@/lib/date';
import {
  GetProviderOfUserResType,
  GetProviderResType,
  ProviderOfUserType,
} from '@/types/provider';
import { useEffect, useState } from 'react';

export default function SettingPage() {
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [providerOfUser, setProviderOfUser] = useState<ProviderOfUserType[]>(
    [],
  );

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
    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchListProviderOfUser = async () => {
      try {
        const res = await fetch('/api/provider-user');
        const data: GetProviderOfUserResType = await res.json();
        if (data.data) {
          setProviderOfUser(data.data);
        } else {
          setProviderOfUser([]);
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
    fetchListProviderOfUser();
  }, []);

  const handleAddProvider = async () => {
    if (!selectedProvider || !apiToken) {
      setCreateError('Please select a provider and enter an API token.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          api_token: apiToken,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setProviders((prev) => [...prev, selectedProvider]);
        setOpen(false);
        setSelectedProvider('');
        setApiToken('');
      } else {
        setCreateError(data.message || 'Failed to add provider');
      }
    } catch (error) {
      if (error instanceof Error) {
        setCreateError(error.message || 'Failed to add provider');
      } else {
        setCreateError('Failed to add provider');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-sidebar flex flex-col p-4">
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
                onClick={handleAddProvider}
                disabled={createLoading}
              >
                {createLoading ? 'Adding...' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full flex-1 flex flex-row gap-3 pt-3">
        <div className="w-full overflow-x-auto ">
          <Table className="w-full h-fit bg-white border border-border rounded-2xl shadow-md">
            <TableCaption className="text-gray-500">
              A list of acceptable providers.
            </TableCaption>
            <TableHeader className="rounded-xl">
              <TableRow className="bg-gray-50">
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead className="w-[220px]">ID</TableHead>
                <TableHead className="w-[120px]">Provider</TableHead>
                <TableHead className="w-[180px]">API Token</TableHead>
                <TableHead className="w-[180px]">Created At</TableHead>
                <TableHead className="w-[180px]">Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="rounded-xl">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-gray-400"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-red-500 py-6"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : (
                providerOfUser.map((provider, index) => (
                  <TableRow
                    key={provider.id}
                    className={`cursor-pointer transition-colors rounded-xl ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-primary/5`}
                  >
                    <TableCell className="font-medium text-center align-middle">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium break-all max-w-[200px] truncate align-middle">
                      {provider.id}
                    </TableCell>
                    <TableCell className="font-medium capitalize align-middle">
                      {provider.provider}
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] break-all truncate line-clamp-1 align-middle">
                      <span title={provider.api_token}>
                        {provider.api_token}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap align-middle">
                      {formatDate(provider.created_at)}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap align-middle">
                      {formatDate(provider.updated_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
