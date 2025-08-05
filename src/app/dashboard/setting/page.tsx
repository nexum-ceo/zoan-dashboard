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
import { Skeleton } from '@/components/ui/skeleton';
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
import { handleErrorApi } from '@/lib/utils';
import {
  useAddProviderMutation,
  useProviderList,
  useProviderOfUserList,
} from '@/queries/useProvider';
import { ProviderOfUserType } from '@/types/provider';
import { useState } from 'react';

export default function SettingPage() {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [apiToken, setApiToken] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);
  const { data: providers, isLoading: providersLoading } = useProviderList();
  const { data: providerOfUser, isLoading: providerOfUserLoading } =
    useProviderOfUserList();
  const addProviderMutation = useAddProviderMutation();

  const handleAddProvider = async () => {
    if (!selectedProvider || !apiToken) {
      setCreateError('Please select a provider and enter an API token.');
      return;
    }

    setCreateError(null);

    try {
      await addProviderMutation.mutateAsync({
        provider: selectedProvider,
        api_token: apiToken,
      });

      setOpen(false);
      setSelectedProvider('');
      setApiToken('');
    } catch (error) {
      handleErrorApi({ error });
      setCreateError('Failed to add provider');
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
                disabled={addProviderMutation.isPending}
              >
                <SelectTrigger className="w-full" autoFocus>
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  {providersLoading
                    ? // Skeleton loading for select options
                      Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="px-2 py-1.5">
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))
                    : providers?.data?.data?.map(
                        (provider: string, idx: number) => (
                          <SelectItem key={idx} value={provider}>
                            {provider.charAt(0).toUpperCase() +
                              provider.slice(1)}
                          </SelectItem>
                        ),
                      )}
                </SelectContent>
              </Select>
              <Input
                placeholder="API Token..."
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                disabled={addProviderMutation.isPending}
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
                disabled={addProviderMutation.isPending}
              >
                {addProviderMutation.isPending ? 'Adding...' : 'Add'}
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
              {providerOfUserLoading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center align-middle">
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="align-middle">
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="align-middle">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="align-middle">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="align-middle">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="align-middle">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : !providerOfUser?.data?.data ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-red-500 py-6"
                  >
                    No providers found
                  </TableCell>
                </TableRow>
              ) : (
                providerOfUser.data.data.map(
                  (provider: ProviderOfUserType, index: number) => (
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
                  ),
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
